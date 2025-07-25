# OPTICART

An intelligent e-commerce platform with dynamic pricing and optimized delivery routes

<div align="center">
  <img src="/client/src/assets/homepage.jpg" alt="Home Page" width="500"/>
</div>

## Table of Contents
- [Overview](#overview)  
- [Features](#features)  
- [Algorithms Used](#algorithms-used)  
- [Tech Stack](#tech-stack)  
- [Architecture](#architecture)  
- [Results and Discussion](#results-and-discussion)  
- [Project Structure](#project-structure)  
- [Firebase Setup Guide](#firebase-setup-guide)  
- [Future Scope](#future-scope)  

---

## Overview

OptiCart is an intelligent e-commerce platform developed to assist small and medium-scale retailers with intelligent dynamic pricing and delivery route optimization. The system adjusts product prices in real-time based on inventory and purchase trends using a momentum-based greedy pricing algorithm. It also incorporates graph-based algorithms such as the Traveling Salesman Problem (TSP) and Minimum Spanning Tree (MST) to optimize delivery paths and reduce logistics costs.

---

## Features

- Real-time dynamic pricing based on stock levels and demand rate  
- Momentum-based price adjustment logic  
- Delivery optimization using TSP and MST  
- Firebase integration for live inventory management  
- Interactive delivery map visualization using OpenRouteService  
- Route graph rendering using Dijkstra-based APIs  
- Modular React frontend with reusable components

---

## Algorithms Used

### 1. Dynamic Pricing Algorithm (Greedy + Momentum-based)

- Prices increase if the product is being bought frequently  
- Prices decrease if a product remains in stock for long  
- Each product has a base price, which is adjusted based on real-time conditions  
- Inventory and frequency are tracked using Firebase  

<div align="center">
  <img src="/client/src/assets/pricing-logic.png" alt="Pricing Logic" width="500"/>
</div>

### 2. Route Optimization Algorithms

- **Traveling Salesman Problem (TSP)**  
  Uses a brute-force approximation to find the shortest path covering all delivery locations.

- **Minimum Spanning Tree (MST)**  
  Utilized to connect delivery nodes with minimal total edge weight.

- **Dijkstra-based Routing API**  
  Integrated via `openRouteAPI.js` to fetch actual road distances and draw optimized delivery paths.

---

## Tech Stack

### Frontend
- ReactJS  
- TailwindCSS  
- OpenRouteService (ORS) API for live map rendering  
- Firebase (for real-time updates and database)  

### Backend
- Node.js with Express  
- Firebase Admin SDK  
- Custom route logic for TSP, MST  
- ORS Proxy for route API abstraction  

---

## Architecture

- **Client Side**  
  - Displays optimized delivery maps and dynamically priced product cards  
  - React Components:
    - `MapRoute.jsx` – shows delivery route  
    - `RouteGraph.jsx` – displays connected delivery points  
    - `DeliveryMap.jsx`, `Home.jsx`, `Landing.jsx` – handle different pages  
  - Firebase Realtime DB is used to listen to stock changes and update product UI accordingly

- **Server Side**  
  - `/routes/products.js` – handles product updates and price changes  
  - `/routes/optimize.js` – endpoint to get optimal delivery route  
  - `/routes/orsProxy.js` – ORS routing handler  
  - `/services/tsp.js` – TSP logic  
  - `/services/mst.js` – MST logic  
  - `/services/openRouteAPI.js` – Distance matrix + path rendering  

---

## Results and Discussion

- ### Dynamic pricing ensures fast-moving products generate higher revenue
  <div align="center">
    <img src="/client/src/assets/dynamicPricing.png" alt="Dynamic Pricing" width="500"/>
  </div>

- ### Slow-moving inventory is cleared at discounted prices to reduce dead stock  
- ### Optimized routes cut down average delivery distances by 30–40%
  <div align="center">
    <img src="/client/src/assets/TSP.png" alt="TSP Optimized Route" width="500"/>
  </div>

  <div align="center">
    <img src="/client/src/assets/MST.png" alt="MST Route" width="500"/>
  </div>

- ### Firebase integration ensures real-time product and route synchronization  
- ### Works efficiently for up to 15–20 delivery locations with acceptable accuracy

---

## Project Structure

### Client (`/client`)
- `src/components`  
  - `MapRoute.jsx`  
  - `RouteGraph.jsx`

- `src/firebase`  
  - `firebaseProduct.js`  
  - `firebaseRoutes.js`

- `src/pages`  
  - `Home.jsx`  
  - `Landing.jsx`  
  - `DeliveryMap.jsx`

- `src/services` – service handlers  
- `src/utils` – utility functions  
- Core files:  
  - `App.js`, `index.js`, `test.js`  
  - `App.css`, `index.css`  
  - `setupTests.js`, `reportWebVitals.js`

### Server (`/server`)
- `routes/`  
  - `products.js`  
  - `optimize.js`  
  - `orsProxy.js`

- `services/`  
  - `tsp.js` – TSP logic  
  - `mst.js` – MST logic  
  - `openRouteAPI.js` – ORS integration  
  - `firebase-config.js` – Firebase initialization

---

## Firebase Setup Guide

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project  
2. Enable **Realtime Database** in test mode  
3. Create a Firebase Web App and obtain the config (apiKey, authDomain, etc.)

4. In `/client/src/firebase/firebaseProduct.js`, replace config:

```js
// firebaseProduct.js
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  databaseURL: "https://your-app.firebaseio.com",
  projectId: "your-app",
  storageBucket: "your-app.appspot.com",
  messagingSenderId: "xxxx",
  appId: "xxxx"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, onValue };
```

5.	Similarly update firebaseRoutes.js for route tracking
6.	In /server/services/firebase-config.js (for admin access):

```js
// firebase-config.js
const admin = require("firebase-admin");
const serviceAccount = require("./your-firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://your-app.firebaseio.com",
});

const db = admin.database();
module.exports = db;

```
7.	Add the your-firebase-service-account.json to .gitignore for security

## Future Scope

- Integration of Machine Learning models for demand forecasting  
- Expand to support cluster-based delivery region segmentation  
- Role-based admin dashboard and order tracking  
- Payment gateway integration for end-to-end commerce solution  
- Docker-based deployment and load testing

---
