#OPTICART

An intelligent e-commerce platform with dynamic pricing and optimized delivery routes

Table of Contents
	•	Overview
	•	Features
	•	Algorithms Used
	•	Tech Stack
	•	Architecture
	•	Results and Discussion
	•	Project Structure
	•	Future Scope
	•	License

⸻

Overview

OptiCart is an AI-powered e-commerce platform developed to assist small and medium-scale retailers with intelligent dynamic pricing and delivery route optimization. The system adjusts product prices in real-time based on inventory and purchase trends using a momentum-based greedy pricing algorithm. It also incorporates graph-based algorithms such as the Traveling Salesman Problem (TSP) and Minimum Spanning Tree (MST) to optimize delivery paths and reduce logistics costs.

⸻

Features
	•	Real-time dynamic pricing based on stock levels and demand rate
	•	Momentum-based price adjustment logic
	•	Delivery optimization using TSP and MST
	•	Real-time data handling with Firebase Firestore
	•	Interactive route visualization using Leaflet
	•	Sales and pricing trend analysis with Recharts
	•	Responsive and modular ReactJS frontend
	•	Purchase logs and history tracking
	•	Toast-based user feedback and notifications

⸻

Algorithms Used

Dynamic Pricing Algorithm (Greedy Logic with Momentum)
	•	Inputs: Stock level, base price, current price, purchase history
	•	A momentum score is calculated based on demand intensity and stock availability
	•	Price formula:
newPrice = clamp(dynamicPrice * (1 + momentum / 100), 0.75 * basePrice, 1.75 * basePrice)
	•	Higher momentum when stock is low and demand is high
	•	Lower momentum when stock is high and demand is low
	•	Momentum is doubled when price is below base to speed up recovery

Traveling Salesman Problem (TSP)
	•	Calculates the shortest possible circular route that visits each delivery point once
	•	Suitable for single-agent delivery networks
	•	Implemented using greedy or brute-force approximation methods
	•	Results visualized on an interactive map

Minimum Spanning Tree (MST)
	•	Generates a minimum-cost path to connect all delivery points without cycles
	•	Implemented using Prim’s Algorithm
	•	Useful for splitting delivery across multiple agents or regions
	•	Reduces overall travel cost by eliminating redundant routes

⸻

Tech Stack

Frontend:
	•	ReactJS
	•	CSS Grid and Flexbox
	•	Recharts for data visualization
	•	React-Toastify for notifications

Backend and Data Handling:
	•	Firebase Firestore (for real-time database and updates)

Visualization and Optimization:
	•	Leaflet for interactive maps
	•	JavaScript (setInterval, state management, greedy logic)

State Management:
	•	React Hooks: useState, useEffect, useRef

⸻

Architecture
	•	Modular and component-driven frontend architecture
	•	Separation of concerns between:
	•	UI rendering
	•	Pricing logic
	•	Delivery algorithms
	•	Firebase operations
	•	Realtime updates with Firestore for stock and pricing
	•	Dynamic rendering of pricing tags and purchase indicators
	•	Delivery routes displayed and updated through Leaflet
	•	Sales trends visualized using graphs

⸻

Results and Discussion

Dynamic Pricing
	•	Prices increased during high demand and reduced when stock was abundant
	•	Momentum-based smoothing avoided abrupt price changes
	•	Prices recovered effectively using boosted momentum logic
	•	Regular cleanup of purchase logs maintained performance

Delivery Optimization
	•	TSP offered shortest circular delivery routes
	•	MST minimized total distance while supporting multiple delivery agents
	•	Map-based visualization enabled clear comparison between routing strategies

User Interface
	•	Tags like “Trending” and “Limited Stock” reflected pricing status
	•	Graphs provided visual analysis of pricing evolution over time
	•	User-friendly layout across screen sizes
	•	Real-time feedback using toast notifications

⸻

Project Structure

OPTICART/
├── client/                     # Frontend (React)
│   ├── public/
│   ├── src/
│   │   ├── assets/             # Static assets like images or icons
│   │   ├── components/         # Reusable React components
│   │   │   ├── MapRoute.jsx
│   │   │   └── RouteGraph.jsx
│   │   ├── firebase/           # Firebase logic for products and routes
│   │   │   ├── firebaseProduct.js
│   │   │   └── firebaseRoutes.js
│   │   ├── pages/              # Page-level React components
│   │   │   ├── DeliveryMap.jsx
│   │   │   ├── Home.jsx
│   │   │   └── Landing.jsx
│   │   ├── services/           # Client-side services (API wrappers, etc.)
│   │   ├── utils/              # Utility functions
│   │   ├── App.js              # Main React component
│   │   ├── App.css
│   │   ├── App.test.js
│   │   ├── index.js            # Entry point for React
│   │   ├── index.css
│   │   ├── logo.svg
│   │   ├── reportWebVitals.js
│   │   ├── setupTests.js
│   │   └── test.js
│   └── .gitignore

├── server/                     # Backend (Node.js + Express)
│   ├── node_modules/
│   ├── routes/                 # API route handlers
│   │   ├── optimize.js
│   │   ├── orsProxy.js
│   │   └── products.js
│   ├── services/               # Core backend services / logic
│   │   ├── mst.js              # MST implementation
│   │   ├── tsp.js              # TSP implementation
│   │   ├── openRouteAPI.js     # External route API handling
│   │   └── firebase-config.js
│   ├── index.js                # Main server entry point
│   ├── package.json
│   └── package-lock.json

├── LICENSE
├── README.md


⸻

Future Scope
	•	Integration of machine learning models for demand forecasting
	•	Incorporation of traffic data for real-time delivery adjustment
	•	Time-window based delivery constraints
	•	Predictive inventory restocking
	•	Multi-vendor support
	•	Progressive Web App (PWA) capabilities

⸻

