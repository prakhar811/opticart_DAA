const express = require('express');
const router = express.Router();
const computeTSP = require('../services/tsp');
const computeMST = require('../services/mst');
const fetchORSRoute = require('../services/openRouteAPI');

// POST /api/optimize
router.post('/', async (req, res) => {
  const { points, algorithm } = req.body;

  if (!Array.isArray(points) || points.length < 2) {
    return res.status(400).json({ error: 'Invalid points array' });
  }

  try {
    if (algorithm === 'TSP') {
      const result = computeTSP(points);

      const coordinates = result.path.map(i => [points[i].x, points[i].y]);

      // Add return-to-start point for TSP
      coordinates.push([points[result.path[0]].x, points[result.path[0]].y]);

      const geometry = await fetchORSRoute(coordinates); // returns encoded polyline string
      console.log("👉 TSP polyline:", geometry);
      return res.json({
        type: 'TSP',
        path: result.path,
        distance: result.distance,
        geometry // 🟢 frontend will decode this
      });
    }

    if (algorithm === 'MST') {
      const result = computeMST(points);

      // Construct coordinate pairs for each edge
      const lines = [];

      for (const [from, to] of result.tree) {
        const coordPair = [
          [points[from].x, points[from].y],
          [points[to].x, points[to].y]
        ];
        const encoded = await fetchORSRoute(coordPair);
        console.log(`🔹 Segment from ${from} to ${to}:`, encoded);
        if (encoded) lines.push(encoded); // encoded polyline string
      }

      return res.json({
        type: 'MST',
        tree: result.tree,
        cost: result.cost,
        lines // 🟢 array of encoded polylines
      });
    }

    return res.status(400).json({ error: 'Invalid algorithm type' });
  } catch (err) {
    console.error("❌ Optimize Route Error:", err);
    res.status(500).json({ error: 'Route optimization failed' });
  }
});

module.exports = router;
