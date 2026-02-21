"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection, addDoc, onSnapshot,
  orderBy, query, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export default function ChatScreen({ convId, targetUser, onBack }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!convId) return;
    const q = query(
      collection(db, "conversations", convId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [convId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, "conversations", convId, "messages"), {
        text: text.trim(),
        senderId: user.uid,
        senderName: user.displayName || "You",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (e) {
      console.error("Send error:", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const currentUid = auth.currentUser?.uid;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf2f8", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        borderBottom: "1px solid #fce7f3",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <button onClick={onBack} style={{
          background: "none", border: "none", cursor: "pointer",
          fontSize: "24px", color: "#7c3aed", padding: "0 8px 0 0"
        }}>
          ←
        </button>

        <div style={{
          width: "42px", height: "42px", borderRadius: "50%",
          backgroundColor: "#ede9fe", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "18px", fontWeight: "bold", color: "#7c3aed"
        }}>
          {(targetUser?.name || "S").charAt(0).toUpperCase()}
        </div>

        <div>
          <p style={{ margin: 0, fontWeight: "bold", fontSize: "16px", color: "#1f2937" }}>
            {targetUser?.name || "Skill Sister"}
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>
            📍 {targetUser?.location || "Kerala"}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "20px 16px",
        display: "flex", flexDirection: "column", gap: "10px"
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "80px" }}>
            <p style={{ fontSize: "48px" }}>💜</p>
            <p style={{ color: "#9ca3af", fontSize: "15px" }}>
              Say hi to {targetUser?.name || "your Skill Sister"}!
            </p>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUid;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%",
                padding: "10px 16px",
                borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                backgroundColor: isMe ? "#ea7a7a" : "#ffffff",
                color: isMe ? "#ffffff" : "#1f2937",
                fontSize: "15px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                border: isMe ? "none" : "1px solid #fce7f3",
                wordBreak: "break-word",
              }}>
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div style={{
        backgroundColor: "#ffffff",
        padding: "12px 16px",
        borderTop: "1px solid #fce7f3",
        display: "flex",
        gap: "10px",
        alignItems: "center",
        position: "sticky",
        bottom: 0,
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          style={{
            flex: 1, padding: "12px 16px",
            borderRadius: "999px",
            border: "1px solid #e9d5ff",
            fontSize: "15px", outline: "none",
            backgroundColor: "#fdf2f8", color: "#1f2937"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !text.trim()}
          style={{
            width: "46px", height: "46px", borderRadius: "50%",
            backgroundColor: text.trim() ? "#ea7a7a" : "#e5e7eb",
            color: "#ffffff", border: "none", fontSize: "20px",
            cursor: text.trim() ? "pointer" : "default",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          ➤
        </button>
      </div>

    </div>
  );
}