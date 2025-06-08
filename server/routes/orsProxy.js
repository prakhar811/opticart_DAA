// /server/routes/orsProxy.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const ORS_API_KEY = "5b3ce3597851110001cf62485d377b15c4514202b629ef67b1a10bf5";

router.post('/route', async (req, res) => {
  try {
    const { coordinates } = req.body;

    const orsRes = await fetch('https://api.openrouteservice.org/v2/directions/driving-car', {
      method: 'POST',
      headers: {
        'Authorization': ORS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
        radiuses: Array(coordinates.length).fill(1000)
      })
    });

    const data = await orsRes.json();

    if (!orsRes.ok) {
      return res.status(orsRes.status).json({ error: data });
    }

    res.json(data);
  } catch (error) {
    console.error("ORS Proxy Error:", error);
    res.status(500).json({ error: "ORS proxy failed" });
  }
});

module.exports = router; // ✅ THIS MUST EXIST
