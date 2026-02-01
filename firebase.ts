import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCMaWAKPvsEa9jCyACv0OX9dpmawDKn70M",
  authDomain: "bup.web.app",
  projectId: "aqwamproject",
  storageBucket: "aqwamproject.firebasestorage.app",
  messagingSenderId: "565860011978",
  appId: "1:565860011978:web:d83fbd1b1da529976d4933",
  measurementId: "G-SKTP6VHJZ6"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
