"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const db = getFirestore();

  const handleLogin = async () => {
    if (!username || !password) return alert("Please enter username and password");
    setLoading(true);
    try {
      // If user typed an email address, use it directly
      let emailToUse = null;
      if (username.includes("@")) {
        emailToUse = username;
      } else {
        // Lookup uid by usernameLower in `usernames` collection
        const usernameKey = username.toLowerCase();
        const nameRef = doc(db, "usernames", usernameKey);
        const nameSnap = await getDoc(nameRef);
        if (!nameSnap.exists()) {
          setLoading(false);
          return alert("No user found with that username");
        }
        const { uid } = nameSnap.data();
        // read the user's document to get email
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          setLoading(false);
          return alert("User profile missing");
        }
        emailToUse = userSnap.data().email;
      }

      await signInWithEmailAndPassword(auth, emailToUse, password);
      alert("Logged in successfully 💜");
      router.push("/dashboard");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-purple-600 text-center">Login 💜</h1>

        <input
          type="text"
          placeholder="Username or email"
          className="w-full p-3 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-purple-500 text-white p-3 rounded-lg disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
