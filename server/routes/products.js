const express = require('express');
const router = express.Router();

let products = [
  { id: 1, name: "Wireless Headphones", image: "http://localhost:3000/headphones.jpg", basePrice: 100, dynamicPrice: 100, stock: 100, totalStock: 100 },
  { id: 2, name: "Smart Watch", image: "http://localhost:3000/watch.jpg", basePrice: 180, dynamicPrice: 180, stock: 80, totalStock: 80 },
  { id: 3, name: "iPhone", image: "http://localhost:3000/iphone.jpg", basePrice: 500, dynamicPrice: 500, stock: 50, totalStock: 50 },
  { id: 4, name: "Laptop", image: "http://localhost:3000/laptop.jpg", basePrice: 1000, dynamicPrice: 1000, stock: 30, totalStock: 30 }
];

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

router.get('/products', (req, res) => {
  const updatedProducts = products.map(p => ({
    ...p,
    dynamicPrice: getDynamicPrice(p.basePrice, p.stock, p.totalStock)
  }));
  res.json(updatedProducts);
});

router.post('/buy/:id', (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProducts = products.map(p => {
    if (p.id === productId && p.stock > 0) {
      const newStock = p.stock - 1;
      return {
        ...p,
        stock: newStock,
        dynamicPrice: getDynamicPrice(p.basePrice, newStock, p.totalStock)
      };
    }
    return p;
  });
  products = updatedProducts;
  res.json(products);
});

router.get('/test', (req, res) => {
  res.json({ message: 'This is a test API endpoint' });
});

module.exports = router;
