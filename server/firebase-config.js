import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBlLYPF9rUmQ43sYYnhm0eDEL3NIw8UOdc",
  authDomain: "opticart-41b16.firebaseapp.com",
  projectId: "opticart-41b16",
  storageBucket: "opticart-41b16.firebasestorage.app",
  messagingSenderId: "727404996456",
  appId: "1:727404996456:web:0d31b8ec749230755018dd",
  measurementId: "G-6H3BR4BP08"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db };
