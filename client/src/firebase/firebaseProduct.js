import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDbmbrTHU_Ql2an9flZWIweN4EPiwk4E_o",
  authDomain: "opticart-3462f.firebaseapp.com",
  projectId: "opticart-3462f",
  storageBucket: "opticart-3462f.firebasestorage.app",
  messagingSenderId: "384037987965",
  appId: "1:384037987965:web:41f872d256e31fe6427314",
  measurementId: "G-L9Y3TTP1L7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };