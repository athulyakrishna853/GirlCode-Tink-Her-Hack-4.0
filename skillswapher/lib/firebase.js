// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB3WCLJsKHB8w_ZhFe9OYEBTiB040nlQjM",
  authDomain: "skillswapher.firebaseapp.com",
  projectId: "skillswapher",
  storageBucket: "skillswapher.firebasestorage.app",
  messagingSenderId: "220494699450",
  appId: "1:220494699450:web:d91c4b2a274afa94ca9b83"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);