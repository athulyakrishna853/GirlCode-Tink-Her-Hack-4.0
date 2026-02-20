"use client";

import { useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "../../lib/firebase";

export default function Ready() {
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const db = getFirestore();

  const findMatches = async () => {
    setLoading(true);

    const querySnapshot = await getDocs(collection(db, "users"));
    const allUsers = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const currentUser = auth.currentUser;
    const me = allUsers.find((u) => u.id === currentUser.uid);

    const compatibleUsers = allUsers
      .filter((user) => user.id !== currentUser.uid)
      .map((user) => {
        let score = 0;

        me.skillsWanted?.forEach((wanted) => {
          user.skillsOffered?.forEach((offered) => {
            if (wanted.name === offered.name) score += 2;
          });
        });

        me.skillsOffered?.forEach((offered) => {
          user.skillsWanted?.forEach((wanted) => {
            if (offered.name === wanted.name) score += 2;
          });
        });

        if (me.location && user.location === me.location) {
          score += 1;
        }

        return { ...user, compatibility: score };
      })
      .filter((user) => user.compatibility > 0)
      .sort((a, b) => b.compatibility - a.compatibility);

    setTimeout(() => {
      setMatches(compatibleUsers);
      setLoading(false);
    }, 2000); // 2-second themed loading delay
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-200 flex flex-col items-center justify-center p-8">

      <h1 className="text-4xl font-bold text-purple-700 mb-4 text-center">
        Ready to Find Your Skill Sister? 💜
      </h1>

      {!loading && matches.length === 0 && (
        <button
          onClick={findMatches}
          className="bg-pink-500 text-white px-8 py-4 rounded-full text-lg shadow-lg hover:bg-pink-600 transition"
        >
          💜 MatchMakeHer
        </button>
      )}

      {loading && (
        <div className="text-center mt-6 animate-pulse">
          <div className="text-6xl">💫</div>
          <p className="text-purple-700 font-medium mt-4">
            Finding your perfect skill match...
          </p>
        </div>
      )}

      {matches.length > 0 && (
        <div className="mt-8 w-full max-w-2xl space-y-4">
          {matches.map((user) => (
            <div
              key={user.id}
              className="bg-white p-6 rounded-2xl shadow-md"
            >
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-600">
                📍 {user.location || "Location not specified"}
              </p>
              <p className="mt-2 text-purple-600 font-medium">
                Compatibility Score: {user.compatibility}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}