import { db } from "../firebase/firebaseRoutes";
import { collection, addDoc } from "firebase/firestore";
import React, { useState } from "react";
import MapRoute from "../components/MapRoute";
import RouteGraph from "../components/RouteGraph";
import polyline from "polyline";

export default function DeliveryMap() {
  const [algo, setAlgo] = useState("TSP");
  const [points, setPoints] = useState([]);
  const [cost, setCost] = useState(0);
  const [routeOrder, setRouteOrder] = useState([]);
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [replayAnim, setReplayAnim] = useState(0);
  const [form, setForm] = useState({ name: "", x: "", y: "" });
  const [showInfo, setShowInfo] = useState(false);
  const [showTripDetails, setShowTripDetails] = useState(false);

  const handleAddPoint = () => {
    if (!form.name || !form.x || !form.y) return;
    const newPoint = {
      id: points.length,
      name: form.name,
      x: parseFloat(form.x),
      y: parseFloat(form.y),
    };
    setPoints([...points, newPoint]);
    setForm({ name: "", x: "", y: "" });
  };

  const runAlgorithm = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ points, algorithm: algo }),
      });

      const result = await response.json();
      if (!result) return;

      let routeNames = [];
      let polylineCoords = [];

      if (algo === "TSP") {
        routeNames = result.path.map((id) => points[id]?.name || `#${id}`);
        if (result.geometry) {
          polylineCoords = polyline.decode(result.geometry);
        }
        setCost(result.distance || 0);
      } else if (algo === "MST") {
        routeNames = [...new Set(result.tree.flat())].map(
          (id) => points[id]?.name || `#${id}`
        );
        if (Array.isArray(result.lines)) {
          polylineCoords = result.lines
            .map((encoded) => polyline.decode(encoded))
            .flat();
        }
        setCost(result.cost || 0);
      }

      setRouteOrder(routeNames);
      setRoadPolyline(polylineCoords);
      setReplayAnim((prev) => prev + 1);

      await addDoc(collection(db, "routes"), {
        timestamp: new Date(),
        algorithm: algo,
        cost: parseFloat(result.distance || result.cost || 0).toFixed(2),
        route: routeNames,
        points: points.map((p) => ({
          name: p.name,
          x: p.x,
          y: p.y,
        })),
      });
    } catch (error) {
      console.error("❌ Optimization error:", error);
    }
  };

  const getStopwiseTimings = () => {
    const speed = 19; // km/h
    const totalTime = cost / speed; // in hours
    const totalMinutes = Math.round(totalTime * 60);
    const perLeg = Math.floor(totalMinutes / (routeOrder.length - 1));
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0);

    const times = [];
    for (let i = 0; i < routeOrder.length; i++) {
      const t = new Date(startTime.getTime() + perLeg * 60000 * i);
      times.push(`${t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`);
    }

    const endTime = new Date(startTime.getTime() + totalMinutes * 60000);
    return { times, endTime };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-900 text-white px-6 py-10">
      <h1 className="text-4xl font-bold text-center mb-4">🚚 Optimize Delivery Routes</h1>
      <p className="text-center text-lg max-w-2xl mx-auto mb-6">
        Choose between TSP or MST algorithms to generate the most efficient delivery paths.
      </p>

      <div className="flex justify-center flex-wrap gap-4 mb-8">
        <button onClick={() => setAlgo("TSP")} className={`px-6 py-2 rounded-l-lg font-semibold ${algo === "TSP" ? "bg-pink-600" : "bg-gray-700"}`}>TSP</button>
        <button onClick={() => setAlgo("MST")} className={`px-6 py-2 rounded-r-lg font-semibold ${algo === "MST" ? "bg-pink-600" : "bg-gray-700"}`}>MST</button>
        <button onClick={runAlgorithm} className="bg-green-500 px-6 py-2 rounded-lg font-semibold shadow-md">Optimize</button>
      </div>

      <div className="bg-white text-black p-4 rounded-lg shadow-md max-w-md mx-auto mb-8">
        <h2 className="text-xl font-bold mb-2">➕ Add Delivery Point</h2>
        <div className="flex flex-col gap-2">
          <input type="text" placeholder="Name (e.g., Warehouse)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="Longitude (x)" value={form.x} onChange={(e) => setForm({ ...form, x: e.target.value })} className="p-2 border rounded" />
          <input type="number" placeholder="Latitude (y)" value={form.y} onChange={(e) => setForm({ ...form, y: e.target.value })} className="p-2 border rounded" />
          <button onClick={handleAddPoint} className="bg-blue-600 text-white py-2 rounded font-semibold mt-2">➕ Add Point</button>
        </div>
      </div>

      <MapRoute points={points} roadPolyline={roadPolyline} />

      <p className="text-center mt-4 text-lg font-semibold">
        Total {algo === 'TSP' ? 'Distance' : 'Cost'}: {cost.toFixed(2)} km
      </p>

      {routeOrder.length > 0 && (
        <div className="text-center mt-4 bg-purple-700 p-4 rounded-xl max-w-3xl mx-auto shadow-lg">
          <p className="text-white font-semibold text-lg mb-1">
            {algo === 'TSP' ? 'TSP Route Order:' : 'MST Connection Order:'}
          </p>
          <p className="text-white text-sm">{routeOrder.join(' → ')}</p>
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => setShowTripDetails(!showTripDetails)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded shadow-md transition"
        >
          📋 Trip Details
        </button>
      </div>

      {showTripDetails && (
        <div className="bg-white text-black mt-4 p-6 max-w-3xl mx-auto rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">🕒 Estimated Delivery Summary</h2>
          <ul className="text-sm leading-6">
            <li>• Total Distance: {cost.toFixed(2)} km</li>
            <li>• Truck Speed: 19 km/h</li>
            <li>• Start Time: 10:00 AM</li>
          </ul>
          <div className="mt-4">
            {(() => {
              const { times, endTime } = getStopwiseTimings();
              return (
                <>
                  <p className="mt-2">⏱️ Estimated Travel Time: <b>~{Math.floor((cost/19))} hr {Math.round(((cost/19) % 1) * 60)} min</b></p>
                  <p>🕓 Estimated Completion Time: <b>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</b></p>
                  <p className="mt-4 font-bold">📍 Stopwise Arrival Estimates:</p>
                  <ul className="list-disc pl-6 text-sm mt-1">
                    {routeOrder.map((label, idx) => (
                      <li key={idx}>→ {label}: {times[idx]}</li>
                    ))}
                  </ul>
                </>
              );
            })()}
          </div>
        </div>
      )}

      <div className="text-center mt-6">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded shadow-md transition"
        >
          ℹ️ {showInfo ? "Hide Explanation" : "How TSP & MST Optimize Delivery"}
        </button>
      </div>

      {showInfo && (
        <div className="mt-4 max-w-6xl mx-auto bg-white text-black rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-center mb-8">📌 How These Algorithms Optimize Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">🧠 TSP – Travelling Salesman Problem (Greedy Approach)</h3>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li><strong>Objective:</strong> Visit all delivery points and return to the starting point.</li>
                <li><strong>Greedy Logic:</strong> Always choose the nearest unvisited point to minimize distance.</li>
                <li><strong>Result:</strong> Forms a complete loop covering all locations efficiently.</li>
                <li><strong>Use Case:</strong> Perfect for single-vehicle delivery loops or closed logistics paths.</li>
                <li><strong>Real-time:</strong> Dynamic price and order changes can trigger re-optimization.</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3">🔗 MST – Minimum Spanning Tree (Prim’s Algorithm)</h3>
              <ul className="list-disc ml-6 space-y-2 text-sm">
                <li><strong>Objective:</strong> Connect all delivery points with minimal total connection cost.</li>
                <li><strong>Prim’s Algorithm:</strong> Start from a node and greedily expand to nearest nodes without forming cycles.</li>
                <li><strong>Tree Structure:</strong> Doesn’t loop, just connects all nodes optimally.</li>
                <li><strong>Use Case:</strong> Ideal for infrastructure planning or multi-vehicle task splitting.</li>
                <li><strong>Real-time:</strong> Useful for designing minimal-cost delivery network topologies.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <RouteGraph
          points={points}
          edges={algo === "TSP" ? points.map((_, i) => [points[i], points[i + 1] || points[0]]) : []}
          algo={algo}
          replayAnim={replayAnim}
        />
      </div>
    </div>
  );
}
