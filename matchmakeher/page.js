"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import ChatScreen from "../../components/ChatScreen";

export default function MatchMakeHer() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatUser, setActiveChatUser] = useState(null);

  useEffect(() => {
    const findMatches = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allUsers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const currentUser = auth.currentUser;
        if (!currentUser) return setLoading(false);

        const me = allUsers.find((u) => u.id === currentUser.uid);
        if (!me) return setLoading(false);

        const compatibleUsers = allUsers
          .filter((user) => user.id !== currentUser.uid)
          .map((user) => {
            let score = 0;
            me.skillsWanted?.forEach((w) =>
              user.skillsOffered?.forEach((o) => {
                if (w.name === o.name) score += 2;
              })
            );
            me.skillsOffered?.forEach((o) =>
              user.skillsWanted?.forEach((w) => {
                if (o.name === w.name) score += 2;
              })
            );
            if (me.location && user.location === me.location) score += 1;
            return { ...user, compatibility: score };
          })
          .filter((user) => user.compatibility > 0)
          .sort((a, b) => b.compatibility - a.compatibility);

        setMatches(compatibleUsers);
      } catch (error) {
        console.error("Match error:", error);
      } finally {
        setLoading(false);
      }
    };

    findMatches();
  }, []);

  const openChat = (targetUser) => {
    const user = auth.currentUser;
    if (!user) return alert("Please login first!");
    if (!targetUser.id) return alert("Target user ID not found!");
    const convId = [user.uid, targetUser.id].sort().join("_");
    setActiveChatUser({ ...targetUser, convId });
  };

  if (activeChatUser) {
    return (
      <ChatScreen
        convId={activeChatUser.convId}
        targetUser={activeChatUser}
        onBack={() => setActiveChatUser(null)}
      />
    );
  }

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", alignItems: "center",
        justifyContent: "center", backgroundColor: "#fdf2f8"
      }}>
        <p style={{ color: "#7c3aed", fontWeight: "bold", fontSize: "18px" }}>
          Matching you with sisters...
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#fdf2f8",
      padding: "40px 20px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>

      <h1 style={{
        fontSize: "28px", fontWeight: "bold",
        color: "#7c3aed", marginBottom: "32px", textAlign: "center"
      }}>
        Ready to Find Your Skill Sister? 💜
      </h1>

      <div style={{
        width: "100%", maxWidth: "600px",
        display: "flex", flexDirection: "column", gap: "16px"
      }}>

        {matches.length === 0 ? (
          <p style={{ textAlign: "center", color: "#6b7280" }}>
            No matches found. Try adding more skills!
          </p>
        ) : (
          matches.map((user) => (
            <div
              key={user.id}
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                border: "1px solid #fce7f3",
              }}
            >

              {/* Row 1: Avatar + Name + Score */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "50%",
                  backgroundColor: "#ede9fe", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", fontWeight: "bold",
                  color: "#7c3aed", flexShrink: 0
                }}>
                  {(user.name || user.displayName || "S").charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#1f2937" }}>
                    {user.name || user.displayName || "Skill Sister"}
                  </p>
                  <p style={{ margin: 0, fontSize: "13px", color: "#9ca3af" }}>
                    📍 {user.location || "Location not specified"}
                  </p>
                </div>

                <div style={{
                  backgroundColor: "#f3e8ff", color: "#7c3aed",
                  padding: "4px 12px", borderRadius: "999px",
                  fontSize: "13px", fontWeight: "bold", whiteSpace: "nowrap"
                }}>
                  ⭐ {user.compatibility}
                </div>
              </div>

              {/* Row 2: Skills */}
              {user.skillsOffered?.length > 0 && (
                <div style={{ marginBottom: "8px" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                    ✨ Offers:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsOffered.map((skill, i) => (
                      <span key={i} style={{
                        backgroundColor: "#fce7f3", color: "#be185d",
                        padding: "2px 10px", borderRadius: "999px", fontSize: "12px"
                      }}>
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {user.skillsWanted?.length > 0 && (
                <div style={{ marginBottom: "14px" }}>
                  <p style={{ margin: "0 0 4px 0", fontSize: "12px", color: "#6b7280", fontWeight: "600" }}>
                    🔍 Wants:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {user.skillsWanted.map((skill, i) => (
                      <span key={i} style={{
                        backgroundColor: "#ede9fe", color: "#6d28d9",
                        padding: "2px 10px", borderRadius: "999px", fontSize: "12px"
                      }}>
                        {skill.name || skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* CHAT BUTTON — hardcoded always visible */}
              <button
                onClick={() => openChat(user)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "14px 0",
                  backgroundColor: "#ea7a7a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  textAlign: "center",
                  marginTop: "4px",
                }}
              >
                💬 Chat with Skill Sister
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
}