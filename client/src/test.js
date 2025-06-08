import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { collection, getDocs, doc, updateDoc, getDoc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pricingMode, setPricingMode] = useState("dynamic");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const productsRef = useRef([]);

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
  
      const productsData = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data(),
      }));
  
      setProducts(productsData); // Update React state for UI
      productsRef.current = productsData; // Keep ref in sync for internal logic
    } catch (error) {
      console.error("Firebase fetch error:", error);
    } finally {
      setLoading(false); // Ensure loading is turned off even if error occurs
    }
  };  

  const handleBuy = async (docId) => {
    try {
      const docRef = doc(db, "products", docId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) { toast.error("❌ Product not found"); return; }
      const data = docSnap.data();
      const newStock = data.stock - 1;
      if (newStock < 0) { toast.error("❌ Out of stock"); return; }
      const timestamp = new Date().toISOString();
      const updatedHistory = Array.isArray(data.purchaseHistory) ? [...data.purchaseHistory, timestamp] : [timestamp];
      await updateDoc(docRef, {
        stock: newStock,
        purchaseHistory: updatedHistory
      });
      toast.success("✅ Purchase successful!");
      fetchProducts();
    } catch (err) {
      console.error("Firebase buy error:", err);
      toast.error("❌ Purchase failed!");
    }
  };

  const getMomentum = (demandRate, stockPenalty, momentum) => {
    if (demandRate < 0.25) momentum -= 4;
    else if (demandRate < 0.5) momentum -= 2;
    else if (demandRate < 1.25) momentum += 0;
    else if (demandRate < 1.5) momentum += 2;
    else if (demandRate < 2) momentum += 5;
    else momentum += 7;
    if (stockPenalty < 0.15) momentum -= 4;
    else if (stockPenalty < 0.3) momentum -= 2;
    else if (stockPenalty < 0.6) momentum += 0;
    else if (stockPenalty < 0.8) momentum += 3;
    else momentum += 6;
    return momentum;
  }

  const getTier = (stock, total) => {
    const ratio = stock / total;
    if (ratio > 0.75) return "Tier 1 – Base Price";
    if (ratio > 0.5) return "Tier 2 – 10% increase";
    if (ratio > 0.25) return "Tier 3 – 25% increase";
    return "Tier 4 – 50% increase";
  };

  const getPriceChartData = (basePrice) => [
    { stock: 100, price: basePrice },
    { stock: 75, price: Math.round(basePrice * 1.1) },
    { stock: 50, price: Math.round(basePrice * 1.25) },
    { stock: 25, price: Math.round(basePrice * 1.5) },
    { stock: 0, price: Math.round(basePrice * 1.5) }
  ];

  useEffect(() => {
    const initPrices = async () => {
      const snapshot = await getDocs(collection(db, 'products'));
      const batch    = writeBatch(db);
      snapshot.docs.forEach(d => {
        const p = d.data();
        batch.update(doc(db, 'products', d.id), { dynamicPrice: p.basePrice, momentum: 100, stock: p.totalStock });
      });
      // Only commit if there's something to write
      if (!snapshot.empty) {
        await batch.commit();
      }
    };
    initPrices();
    fetchProducts();
  }, []); // ← runs only once

  useEffect(() => {
    const interval = setInterval(async () => {
      const now = Date.now();
      const thirtySecAgo   = now - 30_000;
      const oneTwentySecAgo = now - 120_000;
  
      const batch = writeBatch(db);
      let anyUpdates = false;
  
      productsRef.current.forEach(p => {
        if (!p.purchaseHistory) return;
  
        // 1) clean up history & compute metrics
        const cleaned = p.purchaseHistory.filter(ts => new Date(ts).getTime() >= oneTwentySecAgo);
        const demandScore  = cleaned.length;
        const salesRate    = cleaned.filter(ts => new Date(ts).getTime() >= thirtySecAgo).length;
        const avgRate      = demandScore / 4;
        const stockPenalty = 1 - p.stock / p.totalStock;
        const demandRate   = avgRate ? salesRate / avgRate : 0;
        const newMomentum = getMomentum(demandRate, stockPenalty, p.momentum);
        const minPrice = 0.5 * p.basePrice;
        const maxPrice = 1.75 * p.basePrice;
        const newPrice = Math.round(Math.max(minPrice, Math.min(maxPrice, p.dynamicPrice * newMomentum / 100)));
  
        // 2) only add to batch if *something* changed
        const updates = {};
        if (JSON.stringify(cleaned)     !== JSON.stringify(p.purchaseHistory)) updates.purchaseHistory = cleaned;
        if (p.demandScore  !== demandScore)  updates.demandScore  = demandScore;
        if (p.salesRate    !== salesRate)    updates.salesRate    = salesRate;
        if (p.avgRate      !== avgRate)      updates.avgRate      = avgRate;
        if (p.demandRate   !== demandRate)   updates.demandRate   = demandRate;
        if (p.stockPenalty !== stockPenalty) updates.stockPenalty = stockPenalty;
        if (p.dynamicPrice !== newPrice)     updates.dynamicPrice = newPrice;
        if (p.momentum !== newMomentum)      updates.momentum = newMomentum;
  
        if (Object.keys(updates).length) {
          anyUpdates = true;
          const docRef = doc(db, "products", p.docId);
          batch.update(docRef, updates);
        }
      });
  
      if (anyUpdates) {
        try {
          await batch.commit();
          // **REFETCH NOW** so your screen shows the new prices
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
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🛒 OptiCart – Smart Pricing Store</h1>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Pricing Mode:</label>
        <button onClick={() => setPricingMode(pricingMode === "dynamic" ? "static" : "dynamic")} style={{ padding: '10px 20px', borderRadius: '25px', backgroundColor: pricingMode === 'dynamic' ? '#28a745' : '#6c757d', color: 'white', border: 'none', cursor: 'pointer', transition: '0.3s' }}>
          {pricingMode === 'dynamic' ? 'Dynamic Pricing' : 'Static Pricing'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '1100px', margin: 'auto' }}>
        {products.map(p => (
          <div key={p.id} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
            <img src={p.image} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginBottom: '15px' }} />
            <h2 style={{ color: '#007bff', marginBottom: '10px' }}>{p.name}</h2>
            <p><strong>Base:</strong> ₹{p.basePrice}</p>
            <p style={{ fontSize: '18px', fontWeight: 'bold', color: pricingMode==='dynamic'? (p.stock/p.totalStock>0.75?'#28a745':p.stock/p.totalStock>0.5?'#ffc107':p.stock/p.totalStock>0.25?'#fd7e14':'#dc3545'):'#6c757d' }}>
              💸 ₹{pricingMode==='dynamic'?p.dynamicPrice:p.basePrice} <small>({pricingMode})</small>
            </p>
            <p style={{ color: '#666' }}>Stock: {p.stock}/{p.totalStock}</p>
            <p style={{ color: '#008080', fontWeight: 'bold' }}>{getTier(p.stock,p.totalStock)}</p>
            <button onClick={() => handleBuy(p.docId)} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#007bff', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}>Buy Now</button>
          </div>
        ))}
      </div>
      <ToastContainer position="bottom-right" autoClose={2000} />
    </div>
  );
}

export default App;
