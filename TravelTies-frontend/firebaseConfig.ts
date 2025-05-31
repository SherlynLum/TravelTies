// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBHRJyC-ANmiLuS_cZOPFJBvG_Z4bL0HF0",
  authDomain: "travelties-fce2c.firebaseapp.com",
  projectId: "travelties-fce2c",
  storageBucket: "travelties-fce2c.firebasestorage.app",
  messagingSenderId: "304571751866",
  appId: "1:304571751866:web:1a040a992af77aab6ed183",
  measurementId: "G-C1G05ZR420"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
const analytics = getAnalytics(FIREBASE_APP);