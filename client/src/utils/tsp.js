// ✅ STEP 1: utils/tsp.js

export function computeTSP(points) {
  const n = points.length;
  const visited = Array(n).fill(false);
  const path = [0];
  visited[0] = true;
  let totalDist = 0;

  for (let i = 1; i < n; i++) {
    const last = path[path.length - 1];
    let nearest = -1, minDist = Infinity;
    for (let j = 0; j < n; j++) {
      if (!visited[j]) {
        const dx = points[last].x - points[j].x;
        const dy = points[last].y - points[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDist) {
          minDist = dist;
          nearest = j;
        }
      }
    }
    path.push(nearest);
    visited[nearest] = true;
    totalDist += minDist;
  }

  // Return to starting point
  totalDist += Math.sqrt(
    Math.pow(points[path[n - 1]].x - points[0].x, 2) +
    Math.pow(points[path[n - 1]].y - points[0].y, 2)
  );
  path.push(0);

  return { path, distance: totalDist };
}
