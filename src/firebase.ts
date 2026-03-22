import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA5o6z7b_OBOBV6HZtZ1OpTWtqC7XASe8M",
  authDomain: "yt-summarizer-ccf5a.firebaseapp.com",
  projectId: "yt-summarizer-ccf5a",
  storageBucket: "yt-summarizer-ccf5a.firebasestorage.app",
  messagingSenderId: "503322841171",
  appId: "1:503322841171:web:29932b29ad91e9d25a36a6",
  measurementId: "G-JK34CK3JMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged };
