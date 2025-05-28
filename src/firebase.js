// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBftR4wsVbJidecYy_4pFTprzirhh6br4w",
  authDomain: "mathsduel.firebaseapp.com",
  projectId: "mathsduel",
  storageBucket: "mathsduel.firebasestorage.app",
  messagingSenderId: "835923489630",
  appId: "1:835923489630:web:a41c80df39bdd1c05715cf"
};

const app = initializeApp(firebaseConfig);
 export const db = getFirestore(app);
