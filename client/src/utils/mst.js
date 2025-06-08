export function computeMST(points) {
  const n = points.length;
  const visited = Array(n).fill(false);
  const minEdge = Array(n).fill(Infinity);
  const parent = Array(n).fill(-1);
  const edges = [];

  minEdge[0] = 0; // Start from point 0 (Warehouse)

  for (let i = 0; i < n; i++) {
    let u = -1;
    for (let v = 0; v < n; v++) {
      if (!visited[v] && (u === -1 || minEdge[v] < minEdge[u])) {
        u = v;
      }
    }

    visited[u] = true;

    if (parent[u] !== -1) {
      edges.push([parent[u], u]); // edge from parent to current
    }

    for (let v = 0; v < n; v++) {
      const dx = points[u].x - points[v].x;
      const dy = points[u].y - points[v].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (!visited[v] && dist < minEdge[v]) {
        minEdge[v] = dist;
        parent[v] = u;
      }
    }
  }

  const cost = edges.reduce((sum, [u, v]) => {
    const dx = points[u].x - points[v].x;
    const dy = points[u].y - points[v].y;
    return sum + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  return { tree: edges, cost };
}
