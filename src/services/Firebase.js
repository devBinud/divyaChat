// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAwB_VYtw_Zl0N6gRyhGH2Y_2UOE6dSxi8",
  authDomain: "divyaverse-14c9a.firebaseapp.com",
  projectId: "divyaverse-14c9a",
  storageBucket: "divyaverse-14c9a.appspot.com", // ✅ fixed
  messagingSenderId: "302194110805",
  appId: "1:302194110805:web:5961002c34b70d9d06ffdc"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
