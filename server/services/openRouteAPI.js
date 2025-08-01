// /server/services/openRouteAPI.js
const fetch = require('node-fetch');

const ORS_API_KEY = process.env.ORS_API_KEY;

async function fetchORSRoute(coords) {
  try {
    const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates: coords,
        radiuses: Array(coords.length).fill(1000)
      })
    });

    const data = await response.json();

    if (!data.routes || !data.routes[0] || !data.routes[0].geometry) {
      console.error("❌ ORS Error or no geometry:", data);
      return null;
    }

    // ✅ Return encoded geometry string
    return data.routes[0].geometry;
  } catch (err) {
    console.error("❌ ORS Fetch Failed:", err);
    return null;
  }
}

module.exports = fetchORSRoute;