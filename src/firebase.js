// src/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // ✅ Use this for Realtime DB

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_DATABASE_URL, // ✅ This is essential
  projectId: "sted-ls",
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // ✅ Use getDatabase, not getFirestore

export { app,db };
