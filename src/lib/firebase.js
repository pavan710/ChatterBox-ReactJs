import { initializeApp } from "firebase/app";
import {getAuth} from "firebase/auth"
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
const firebaseConfig = {
  apiKey: "AIzaSyAx2DEwilyN63NAf-7WbC11zlTMLVceVZk",
  authDomain: "reactchat-3242b.firebaseapp.com",
  projectId: "reactchat-3242b",
  storageBucket: "reactchat-3242b.appspot.com",
  messagingSenderId: "396023680336",
  appId: "1:396023680336:web:da23eb575bb3277ccb3055"
};
const app = initializeApp(firebaseConfig);
export const auth=getAuth();
export const db=getFirestore()
export const storage=getStorage()