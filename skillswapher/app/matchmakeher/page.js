"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { auth } from "../../lib/firebase";
import Link from "next/link";

export default function MatchMakeHer() {
  const [matches, setMatches] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const findMatches = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const allUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const currentUser = auth.currentUser;
      const me = allUsers.find((u) => u.id === currentUser.uid);

      if (!me) return;

      const compatibleUsers = allUsers
        .filter((user) => user.id !== currentUser.uid)
        .map((user) => {
          let score = 0;

          // Match: My wanted vs Their offered
          me.skillsWanted?.forEach((wanted) => {
            user.skillsOffered?.forEach((offered) => {
              if (wanted.name === offered.name) {
                score += 2;
              }
            });
          });

          // Match: My offered vs Their wanted
          me.skillsOffered?.forEach((offered) => {
            user.skillsWanted?.forEach((wanted) => {
              if (offered.name === wanted.name) {
                score += 2;
              }
            });
          });

          // Bonus for same location
          if (me.location && user.location === me.location) {
            score += 1;
          }

          return { ...user, compatibility: score };
        })
        .filter((user) => user.compatibility > 0)
        .sort((a, b) => b.compatibility - a.compatibility);

      setMatches(compatibleUsers);
    };

    findMatches();
  }, []);

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
        💜 MatchMakeHer Results
      </h1>

      {matches.length === 0 && (
        <p className="text-center">No compatible matches found yet.</p>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {matches.map((user) => {
          const currentUser = auth.currentUser;
          const convId = currentUser
            ? [currentUser.uid, user.id].sort().join("_")
            : null;

          return (
            <div key={user.id} className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-600 mb-2">
                📍 {user.location || "Location not specified"}
              </p>

              <p className="font-medium text-purple-600">Compatibility Score: {user.compatibility}</p>

              {convId && (
                <div className="mt-4">
                  <Link href={`/chat/${convId}`} className="inline-block bg-pink-500 text-white px-4 py-2 rounded-md">
                    Chat
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}