const { getDistance } = require('geolib');

function computeTSP(points) {
  const n = points.length;
  const visited = Array(n).fill(false);
  const path = [0];
  visited[0] = true;
  let total = 0;

  for (let step = 0; step < n - 1; step++) {
    const last = path[path.length - 1];
    let next = -1;
    let minDist = Infinity;

    for (let i = 0; i < n; i++) {
      if (!visited[i]) {
        const dist = getDistance(
          { latitude: points[last].y, longitude: points[last].x },
          { latitude: points[i].y, longitude: points[i].x }
        );
        if (dist < minDist) {
          minDist = dist;
          next = i;
        }
      }
    }

    path.push(next);
    visited[next] = true;
    total += minDist;
  }

  // Return to starting point
  total += getDistance(
    { latitude: points[path[path.length - 1]].y, longitude: points[path[path.length - 1]].x },
    { latitude: points[0].y, longitude: points[0].x }
  );
  path.push(0);

  // Approximate road distance by scaling geodesic distance by 1.2
  return {
    path,
    distance: parseFloat(((total / 1000) * 1.2).toFixed(2))  // result in km
  };
}

module.exports = computeTSP;