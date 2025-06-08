// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBlLYPF9rUmQ43sYYnhm0eDEL3NIw8UOdc",
  authDomain: "opticart-41b16.firebaseapp.com",
  projectId: "opticart-41b16",
  storageBucket: "opticart-41b16.firebasestorage.app",
  messagingSenderId: "727404996456",
  appId: "1:727404996456:web:0d31b8ec749230755018dd",
  measurementId: "G-6H3BR4BP08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
