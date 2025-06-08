const { getDistance } = require('geolib');

function computeMST(points) {
  const n = points.length;
  const inTree = Array(n).fill(false);
  const cost = Array(n).fill(Infinity);
  const parent = Array(n).fill(-1);
  const edges = [];
  let total = 0;

  cost[0] = 0;

  for (let count = 0; count < n; count++) {
    let u = -1;
    for (let i = 0; i < n; i++) {
      if (!inTree[i] && (u === -1 || cost[i] < cost[u])) {
        u = i;
      }
    }

    inTree[u] = true;
    if (parent[u] !== -1) {
      edges.push([parent[u], u]);
      total += cost[u];
    }

    for (let v = 0; v < n; v++) {
      if (!inTree[v]) {
        const dist = getDistance(
          { latitude: points[u].y, longitude: points[u].x },
          { latitude: points[v].y, longitude: points[v].x }
        );
        if (dist < cost[v]) {
          cost[v] = dist;
          parent[v] = u;
        }
      }
    }
  }

  return {
    tree: edges,
    cost: parseFloat(((total / 1000) * 1.2).toFixed(2)) // road-adjusted km
  };
}

module.exports = computeMST;
