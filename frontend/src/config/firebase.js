import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBqM9PVjixN0qMCi9-XklycUoVUQs_cesg",
  authDomain: "ojhub-a3329.firebaseapp.com",
  projectId: "ojhub-a3329",
  storageBucket: "ojhub-a3329.firebasestorage.app",
  messagingSenderId: "414352803069",
  appId: "1:414352803069:web:7cd5c2db7382cc4b4eea94",
  measurementId: "G-Y5RCHFZBLW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup };
