// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDbmbrTHU_Ql2an9flZWIweN4EPiwk4E_o",
  authDomain: "opticart-3462f.firebaseapp.com",
  projectId: "opticart-3462f",
  storageBucket: "opticart-3462f.firebasestorage.app",
  messagingSenderId: "384037987965",
  appId: "1:384037987965:web:41f872d256e31fe6427314",
  measurementId: "G-L9Y3TTP1L7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);