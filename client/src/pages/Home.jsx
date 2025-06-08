import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LineChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { collection, getDocs, doc, updateDoc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase/firebaseProduct";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingMode, setPricingMode] = useState("dynamic");
  const [expandedProductIds, setExpandedProductIds] = useState([]);
  const productsRef = useRef([]);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsData = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
      productsRef.current = productsData;
    } catch (error) {
      console.error("Firebase fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (docId) => {
    try {
      const docRef = doc(db, "products", docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return toast.error("❌ Product not found");
      const data = docSnap.data();
      const newStock = data.stock - 1;
      if (newStock < 0) return toast.error("❌ Out of stock");
      const timestamp = new Date().toISOString();
      const updatedHistory = Array.isArray(data.purchaseHistory) ? [...data.purchaseHistory, timestamp] : [timestamp];
      const newEntry = { stock: newStock + 1, price: data.dynamicPrice, ts: timestamp };
      const updatedLog = Array.isArray(data.saleLog) ? [...data.saleLog, newEntry] : [newEntry];
      await updateDoc(docRef, {
        stock: newStock,
        purchaseHistory: updatedHistory,
        saleLog: updatedLog
      });
      toast.success("✅ Purchase successful!");
      fetchProducts();
    } catch (err) {
      console.error("Firebase buy error:", err);
      toast.error("❌ Purchase failed!");
    }
  };

  const getMomentum = (demandRate, stockPenalty, momentum, basePrice, dynamicPrice) => {
    if (stockPenalty === 1) return 0;
    momentum = 0;
    if (demandRate < 0.25) momentum -= (basePrice > dynamicPrice) ? 2 : 3;
    else if (demandRate < 0.5) momentum -= (basePrice > dynamicPrice) ? 0 : 1;
    else if (demandRate < 1.25) momentum += (basePrice > dynamicPrice) ? 1 : 0;
    else if (demandRate < 1.5) momentum += (basePrice > dynamicPrice) ? 2 : 1;
    else if (demandRate < 2) momentum += (basePrice > dynamicPrice) ? 3 : 2;
    else momentum += (basePrice > dynamicPrice) ? 4 : 3;
    if (stockPenalty < 0.25) momentum -= (basePrice > dynamicPrice) ? 1 : 2;
    else if (stockPenalty < 0.4) momentum -= (basePrice > dynamicPrice) ? 0 : 1;
    else if (stockPenalty < 0.65) momentum += (basePrice > dynamicPrice) ? 1 : 0;
    else if (stockPenalty < 0.9) momentum += (basePrice > dynamicPrice) ? 3 : 1;
    else momentum += (basePrice > dynamicPrice) ? 4 : 2;
    return momentum;
  };

  const getTier = (basePrice, dynamicPrice, demandRate, stockPenalty) => {
    if (stockPenalty === 1) return "🚫 OUT OF STOCK!";
    if (stockPenalty >= 0.8) return "⏳ HURRY! LIMITED STOCK";
    if (demandRate >= 1.5) return "🔥 TRENDING!";
    if (dynamicPrice < basePrice) return "🤑 DISCOUNT AVAILABLE!";
    return "✅ BEST PRICE!";
  };

  useEffect(() => {
    const initPrices = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        const p = d.data();
        batch.update(doc(db, 'products', d.id), {
          dynamicPrice: p.basePrice,
          momentum: 0,
          stock: p.totalStock,
          saleLog: [],
          purchaseHistory: []
        });
      });
      if (!snapshot.empty) await batch.commit();
    };
    initPrices();
    fetchProducts();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const thirtySecAgo = now - 30000;
      const oneTwentySecAgo = now - 120000;
      const batch = writeBatch(db);
      let anyUpdates = false;

      productsRef.current.forEach(p => {
        if (!p.purchaseHistory) return;
        const cleaned = p.purchaseHistory.filter(ts => new Date(ts).getTime() >= oneTwentySecAgo);
        const demandScore = cleaned.length;
        const salesRate = cleaned.filter(ts => new Date(ts).getTime() >= thirtySecAgo).length;
        const avgRate = demandScore / 4;
        const stockPenalty = 1 - p.stock / p.totalStock;
        const demandRate = avgRate ? salesRate / avgRate : 0;
        const newMomentum = getMomentum(demandRate, stockPenalty, p.momentum, p.basePrice, p.dynamicPrice);
        const minPrice = 0.5 * p.basePrice;
        const maxPrice = 1.75 * p.basePrice;
        const newPrice = Math.round(Math.max(minPrice, Math.min(maxPrice, p.dynamicPrice * (100 + newMomentum) / 100)));

        const updates = {};
        if (JSON.stringify(cleaned) !== JSON.stringify(p.purchaseHistory)) updates.purchaseHistory = cleaned;
        if (p.demandScore !== demandScore) updates.demandScore = demandScore;
        if (p.salesRate !== salesRate) updates.salesRate = salesRate;
        if (p.avgRate !== avgRate) updates.avgRate = avgRate;
        if (p.demandRate !== demandRate) updates.demandRate = demandRate;
        if (p.stockPenalty !== stockPenalty) updates.stockPenalty = stockPenalty;
        if (p.dynamicPrice !== newPrice) updates.dynamicPrice = newPrice;
        if (p.momentum !== newMomentum) updates.momentum = newMomentum;

        if (Object.keys(updates).length) {
          anyUpdates = true;
          batch.update(doc(db, "products", p.docId), updates);
        }
      });

      if (anyUpdates) {
        try {
          await batch.commit();
          await fetchProducts();
        } catch (e) {
          console.error("Batch commit failed:", e);
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: '40px', backgroundColor: '#f0f8ff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontWeight: 700 }}>🛒 OptiCart – Smart Pricing Store</h1>
        <button
          onClick={() => navigate("/delivery-map")}
          style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '25px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🚚 Delivery Optimizer
        </button>
      </div>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Pricing Mode:</label>
        <button onClick={() => setPricingMode(pricingMode === "dynamic" ? "static" : "dynamic")}
          style={{
            padding: '10px 20px',
            borderRadius: '25px',
            backgroundColor: pricingMode === 'dynamic' ? '#28a745' : '#6c757d',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            transition: '0.3s'
          }}>
          {pricingMode === 'dynamic' ? 'Dynamic Pricing' : 'Static Pricing'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1100px', margin: 'auto' }}>
        {products.map(p => (
          <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>{p.name}</h2>
            <p><strong>Base:</strong> ₹{p.basePrice}</p>
            <p style={{
              fontSize: '18px',
              fontWeight: 'bold',
              color: pricingMode === 'dynamic'
                ? (p.stockPenalty === 1
                  ? '#6c757d'
                  : (p.stockPenalty > 0.8
                    ? '#dc3545'
                    : (p.demandRate > 1.5
                      ? '#ffc107'
                      : (p.dynamicPrice < p.basePrice ? '#28a745' : '#fd7e14'))))
                : '#6c757d'
            }}>
              💸 ₹{pricingMode === 'dynamic' ? p.dynamicPrice : p.basePrice} <small>({pricingMode})</small>
            </p>
            <p style={{ color: '#666' }}>Stock: {p.stock}/{p.totalStock}</p>
            <p style={{ color: '#6c757d', fontWeight: 'bold' }}>{getTier(p.basePrice, p.dynamicPrice, p.demandRate, p.stockPenalty)}</p>
            <button onClick={() => handleBuy(p.docId)} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              Buy Now
            </button>

            <div style={{ marginTop: '10px' }}>
              <button
                onClick={() => setExpandedProductIds(prev => prev.includes(p.docId) ? prev.filter(id => id !== p.docId) : [...prev, p.docId])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: 0
                }}
              >
                {expandedProductIds.includes(p.docId) ? '⬆️ Hide Sales Graph' : '⬇️ Show Sales Graph'}
              </button>

              {expandedProductIds.includes(p.docId) && p.saleLog?.length > 0 && (
                <div style={{
                  marginTop: '15px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  padding: '10px'
                }}>
                  <h4 style={{ marginBottom: '5px' }}>📊 Stock vs Price Visualization</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={p.saleLog}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stock" name="Stock" />
                      <YAxis dataKey="price" name="Price" tickFormatter={v => `₹${v}`} domain={[p.basePrice * 0.5, p.basePrice * 1.75]} />
                      <Tooltip formatter={(value, name) => [`₹${value}`, name]} labelFormatter={label => `stock : ${label}`} />
                      <ReferenceLine y={p.basePrice} stroke="red" strokeWidth={2} label={{ value: `Base ₹${p.basePrice}`, position: 'right', fill: 'red' }} />
                      <Line type="monotone" dataKey="price" stroke="#007bff" strokeWidth={2} dot={{ r: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default Home;
