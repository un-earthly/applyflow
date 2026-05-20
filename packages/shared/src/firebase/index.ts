import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
};

export function initFirebase(config: FirebaseConfig): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(config);
}

export { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
export {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
export { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
