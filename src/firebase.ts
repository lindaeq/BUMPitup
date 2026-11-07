// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2sve1ikICdCHttU1DnV9MnzoPL7OwvrY",
  authDomain: "physiofreaks-8f5a4.firebaseapp.com",
  databaseURL: "https://physiofreaks-8f5a4-default-rtdb.firebaseio.com",
  projectId: "physiofreaks-8f5a4",
  storageBucket: "physiofreaks-8f5a4.firebasestorage.app",
  messagingSenderId: "442834768132",
  appId: "1:442834768132:web:f10c56762669a3f32b8051",
  measurementId: "G-HGDVGS8YH3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);