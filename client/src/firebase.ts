// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD5rVFP_n5wSVwl7_I8vm6HpLc75oVEbog",
  authDomain: "frontend-takehome-knguyen.firebaseapp.com",
  projectId: "frontend-takehome-knguyen",
  storageBucket: "frontend-takehome-knguyen.appspot.com",
  messagingSenderId: "850675649803",
  appId: "1:850675649803:web:c8fe398dce0758f8c9a60e",
  measurementId: "G-8JDDZM25BY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;
