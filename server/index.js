const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

const optimizeRoutes = require('./routes/optimize');
const orsProxyRoute = require('./routes/orsProxy');
const productRoutes = require('./routes/products');

app.use(cors());
app.use(express.json());

// === Routes ===
app.use('/api/optimize', optimizeRoutes);
app.use('/api/ors', orsProxyRoute);
app.use('/api', productRoutes);

app.get('/', (req, res) => {
  res.send('✅ Opticart Backend Running');
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
