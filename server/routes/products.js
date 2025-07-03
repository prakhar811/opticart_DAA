const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Initialize Firebase Admin (add this to your server/index.js or create a separate config file)
if (!admin.apps.length) {
  const serviceAccount = require('../firebase-service-account.json'); // Download from Firebase Console
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const initialProducts = [
  { id: 1, name: "Wireless Headphones", image: "http://localhost:3000/headphones.jpg", basePrice: 100, dynamicPrice: 100, stock: 100, totalStock: 100 },
  { id: 2, name: "Smart Watch", image: "http://localhost:3000/watch.jpg", basePrice: 180, dynamicPrice: 180, stock: 80, totalStock: 80 },
  { id: 3, name: "iPhone", image: "http://localhost:3000/iphone.jpg", basePrice: 500, dynamicPrice: 500, stock: 50, totalStock: 50 },
  { id: 4, name: "Laptop", image: "http://localhost:3000/laptop.jpg", basePrice: 1000, dynamicPrice: 1000, stock: 30, totalStock: 30 },
  { id: 5, name: "iPad", image: "http://localhost:3000/ipad.jpg", basePrice: 750, dynamicPrice: 750, stock: 40, totalStock: 40 },
  { id: 6, name: "Speaker", image: "http://localhost:3000/speaker.jpg", basePrice: 350, dynamicPrice: 350, stock: 60, totalStock: 60 }
];

// Initialize products in Firestore if they don't exist
async function initializeProducts() {
  try {
    const productsRef = db.collection('products');
    const snapshot = await productsRef.get();
    
    // Check if we need to add new products
    const existingIds = snapshot.docs.map(doc => parseInt(doc.id));
    const newProducts = initialProducts.filter(product => !existingIds.includes(product.id));
    
    if (newProducts.length > 0) {
      console.log(`Adding ${newProducts.length} new products to Firestore...`);
      const batch = db.batch();
      
      newProducts.forEach(product => {
        const docRef = productsRef.doc(product.id.toString());
        batch.set(docRef, {
          ...product,
          saleLog: [],
          purchaseHistory: [],
          momentum: 0,
          demandScore: 0,
          salesRate: 0,
          avgRate: 0,
          demandRate: 0,
          stockPenalty: 0
        });
      });
      
      await batch.commit();
      console.log('New products added successfully');
    } else if (snapshot.empty) {
      console.log('Initializing all products in Firestore...');
      const batch = db.batch();
      
      initialProducts.forEach(product => {
        const docRef = productsRef.doc(product.id.toString());
        batch.set(docRef, {
          ...product,
          saleLog: [],
          purchaseHistory: [],
          momentum: 0,
          demandScore: 0,
          salesRate: 0,
          avgRate: 0,
          demandRate: 0,
          stockPenalty: 0
        });
      });
      
      await batch.commit();
      console.log('All products initialized successfully');
    } else {
      console.log('Products already exist in Firestore');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
  }
}

// Call initialization
initializeProducts();

function getDynamicPrice(basePrice, stock, totalStock) {
  let adjustmentFactor = 0;
  const stockPenalty = 1 - stock / totalStock;
  const demandRate = (totalStock - stock) / totalStock;

  if (demandRate < 0.25) adjustmentFactor -= 0.3;
  else if (demandRate < 0.5) adjustmentFactor -= 0.1;
  else if (demandRate < 1.25) adjustmentFactor += 0;
  else if (demandRate < 1.5) adjustmentFactor += 0.05;
  else if (demandRate < 2) adjustmentFactor += 0.1;
  else adjustmentFactor += 0.3;

  if (stockPenalty < 0.15) adjustmentFactor -= 0.05;
  else if (stockPenalty < 0.3) adjustmentFactor -= 0.02;
  else if (stockPenalty < 0.6) adjustmentFactor += 0;
  else if (stockPenalty < 0.8) adjustmentFactor += 0.1;
  else adjustmentFactor += 0.25;

  let newPrice = basePrice * (1 + adjustmentFactor);
  return Math.round(Math.max(0.5 * basePrice, Math.min(1.75 * basePrice, newPrice)));
}

router.get('/products', async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const products = [];
    
    snapshot.forEach(doc => {
      const productData = doc.data();
      products.push({
        docId: doc.id,
        ...productData,
        dynamicPrice: getDynamicPrice(productData.basePrice, productData.stock, productData.totalStock)
      });
    });
    
    res.json(products.sort((a, b) => a.id - b.id));
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/buy/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const productRef = db.collection('products').doc(productId);
    
    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new Error('Product not found');
      }
      
      const productData = productDoc.data();
      
      if (productData.stock <= 0) {
        throw new Error('Product out of stock');
      }
      
      const newStock = productData.stock - 1;
      const timestamp = new Date().toISOString();
      const updatedHistory = Array.isArray(productData.purchaseHistory) 
        ? [...productData.purchaseHistory, timestamp] 
        : [timestamp];
      
      const newEntry = { 
        stock: newStock + 1, 
        price: productData.dynamicPrice, 
        ts: timestamp 
      };
      const updatedLog = Array.isArray(productData.saleLog) 
        ? [...productData.saleLog, newEntry] 
        : [newEntry];
      
      transaction.update(productRef, {
        stock: newStock,
        purchaseHistory: updatedHistory,
        saleLog: updatedLog,
        dynamicPrice: getDynamicPrice(productData.basePrice, newStock, productData.totalStock)
      });
    });
    
    // Return updated products
    const snapshot = await db.collection('products').get();
    const products = [];
    
    snapshot.forEach(doc => {
      const productData = doc.data();
      products.push({
        docId: doc.id,
        ...productData
      });
    });
    
    res.json(products.sort((a, b) => a.id - b.id));
  } catch (error) {
    console.error('Error buying product:', error);
    res.status(500).json({ error: error.message || 'Failed to purchase product' });
  }
});

router.get('/test', (req, res) => {
  res.json({ message: 'This is a test API endpoint' });
});

module.exports = router;