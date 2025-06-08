import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import DeliveryMap from './pages/DeliveryMap';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />              {/* Landing/Homepage */}
      <Route path="/shop" element={<Home />} />            {/* Smart Pricing Page */}
      <Route path="/delivery-map" element={<DeliveryMap />} />{/* Delivery Optimizer */}
      <Route path="*" element={<h2 className="text-center text-red-500 text-xl mt-10">🚫 Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
