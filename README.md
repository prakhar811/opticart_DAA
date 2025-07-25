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
  <img src="/client/src/assets/dynamicPricing.png" alt="Home Page" width="500"/>
</div>


- ### Slow-moving inventory is cleared at discounted prices to reduce dead stock  
- ### Optimized routes cut down average delivery distances by 30–40%
<div align="center">
  <img src="/client/src/assets/TSP.png" alt="Home Page" width="500"/>
</div>


<div align="center">
  <img src="/client/src/assets/MST.png" alt="Home Page" width="500"/>
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

## Future Scope

- Integration of Machine Learning models for demand forecasting  
- Expand to support cluster-based delivery region segmentation  
- Role-based admin dashboard and order tracking  
- Payment gateway integration for end-to-end commerce solution  
- Docker-based deployment and load testing

---
