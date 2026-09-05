// =========================================================
// FIREBASE CONFIG - GANTI dengan config project Firebase kamu sendiri
// (Firebase Console > Project Settings > General > Your apps > SDK setup)
// File ini dipakai bareng oleh SEMUA halaman, jadi cukup edit di SINI SAJA.
// =========================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  getFirestore
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAdQmkcS0b1CHIr_443DBBmjSm2_84bAt0",
  authDomain: "realms-17933.firebaseapp.com",
  projectId: "realms-17933",
  storageBucket: "realms-17933.firebasestorage.app",
  messagingSenderId: "359945998479",
  appId: "1:359945998479:web:7de1cc21419c25221260fa"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Helper: pastikan user login, kalau belum lempar ke login.html
export function requireLogin(callback){
  onAuthStateChanged(auth, (user) => {
    if (!user){
      window.location.href = "login.html";
    } else {
      callback(user);
    }
  });
}

// Helper: cek status login tanpa maksa redirect (buat halaman publik)
export function watchLogin(callback){
  onAuthStateChanged(auth, callback);
}

export function logout(){
  signOut(auth).then(() => window.location.href = "index.html");
}
