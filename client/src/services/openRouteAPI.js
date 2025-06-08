export async function fetchORSRoute(coordinates) {
  try {
    const response = await fetch('http://localhost:5001/api/ors/route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ coordinates })
    });

    const result = await response.json();

    if (result?.routes?.[0]?.geometry?.coordinates) {
      return result.routes[0].geometry.coordinates; // [lng, lat] pairs
    } else {
      console.error("ORS API Error or no geometry:", result);
      return [];
    }
  } catch (err) {
    console.error("Failed to fetch route from ORS:", err);
    return [];
  }
}
