// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAMqVOR_LldCrq0_j-vpaTNYUwmXWWtTFc",
  authDomain: "govind-jewellers.firebaseapp.com",
  projectId: "govind-jewellers",
  storageBucket: "govind-jewellers.firebasestorage.app",
  messagingSenderId: "532645159034",
  appId: "1:532645159034:web:e30f91be361fe52f0e5bc3",
  measurementId: "G-NHN5G8KRGY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };