import React from "react";
import { useNavigate } from "react-router-dom";
import background from "../assets/homepage.jpg"; // use clean image without embedded logo

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-end pb-32"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="flex gap-6 z-10">
        <button
          onClick={() => navigate("/shop")}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-6 rounded shadow-md"
        >
          🛒 Smart Shopping
        </button>
        <button
          onClick={() => navigate("/delivery-map")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded shadow-md"
        >
          🚚 Delivery Optimizer
        </button>
      </div>
    </div>
  );
}
