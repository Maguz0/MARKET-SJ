// src/js/firebase.js - CONFIGURACIÓN REAL
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB8ti26bz1iEqQwtOC2i5PZf9-JidXhjzY",
  authDomain: "san-jorge-market.firebaseapp.com",
  projectId: "san-jorge-market",
  storageBucket: "san-jorge-market.firebasestorage.app",
  messagingSenderId: "201668136054",
  appId: "1:201668136054:web:2c367f1c076efc5d542357",
  measurementId: "G-TM4F2YTML9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios que necesitas
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exportar para uso en otros archivos
export { auth, db, storage };
