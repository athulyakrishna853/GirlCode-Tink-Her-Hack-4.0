import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB3WCLJsKHB8w_ZhFe9OYEBTiB040nlQjM",
  authDomain: "skillswapher.firebaseapp.com",
  projectId: "skillswapher",
  storageBucket: "skillswapher.firebasestorage.app",
  messagingSenderId: "220494699450",
  appId: "1:220494699450:web:d91c4b2a274afa94ca9b83"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);