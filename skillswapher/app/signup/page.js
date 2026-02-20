"use client";

import { useState } from "react";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { getFirestore, doc, runTransaction } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const db = getFirestore();

  const handleSignup = async () => {
    if (!username || !email || !password) return alert("Please fill all fields");
    if (username.length < 3) return alert("Username must be at least 3 characters");
    if (password.length < 6) return alert("Password must be at least 6 characters");

    setLoading(true);
    let user = null;
    try {
      // Create the auth user first so subsequent Firestore transaction runs authenticated
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;

      const usernameKey = username.toLowerCase();

      // Use a transaction to atomically reserve the username and create the user profile
      await runTransaction(db, async (tx) => {
        const nameRef = doc(db, "usernames", usernameKey);
        const nameSnap = await tx.get(nameRef);
        if (nameSnap.exists()) {
          throw new Error("UsernameTaken");
        }

        // Reserve username
        tx.set(nameRef, { uid: user.uid });

        // Create user profile
        const userRef = doc(db, "users", user.uid);
        tx.set(userRef, {
          username,
          usernameLower: usernameKey,
          email,
          bio: "",
          location: "",
          skillsOffered: [],
          skillsWanted: [],
          createdAt: new Date()
        });
      });

      alert("Account created successfully 💜");
      router.push("/dashboard");

    } catch (error) {
      // Handle username collision specially: delete newly created auth user
      if (error && error.message === "UsernameTaken") {
        if (user) {
          try {
            await deleteUser(user);
          } catch (delErr) {
            console.error("Failed to delete user after username collision:", delErr);
          }
        }
        return alert("Username already taken. Choose another one.");
      }

      alert(error.message || String(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-purple-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-purple-600 text-center">Create Your Account 💜</h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 border rounded"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-purple-500 text-white p-3 rounded-lg disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </div>
    </div>
  );
}