"use client";

import { useEffect, useState, useRef } from "react";
import { getFirestore, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "../../../lib/firebase";

export default function ChatClient({ convId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const db = getFirestore();
  const listRef = useRef();

  useEffect(() => {
    // ensure conversation doc exists with participants
    const ensureConversation = async () => {
      const parts = convId.split("_");
      if (parts.length !== 2) return;
      const [a, b] = parts;
      const convoRef = doc(db, "conversations", convId);
      const convoSnap = await getDoc(convoRef);
      if (!convoSnap.exists()) {
        const user = auth.currentUser;
        if (!user) return; // user must be signed in to create convo
        // only allow creation if current user is one of the participants
        if (user.uid !== a && user.uid !== b) return;
        await setDoc(convoRef, { participants: [a, b], createdAt: serverTimestamp() });
      }
    };

    ensureConversation();

    const messagesRef = collection(db, "conversations", convId, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      // scroll to bottom
      setTimeout(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    }, (err) => {
      console.error("messages snapshot error", err);
    });

    return () => unsub();
  }, [convId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const user = auth.currentUser;
    if (!user) return alert("Please log in to send messages");

    setLoading(true);
    try {
      const messagesRef = collection(db, "conversations", convId, "messages");
      await addDoc(messagesRef, {
        senderUid: user.uid,
        text: text.trim(),
        createdAt: serverTimestamp()
      });
      setText("");
    } catch (err) {
      console.error(err);
      alert(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-4 flex flex-col">
        <div className="flex-1 overflow-auto mb-4" style={{ maxHeight: '60vh' }}>
          {messages.map((m) => (
            <div key={m.id} className={`p-2 my-1 rounded ${m.senderUid === auth.currentUser?.uid ? 'bg-purple-100 self-end' : 'bg-gray-100 self-start'}`}>
              <div className="text-sm text-gray-700">{m.text}</div>
              <div className="text-xs text-gray-400 mt-1">{m.senderUid}</div>
            </div>
          ))}
          <div ref={listRef} />
        </div>

        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Message..." />
          <button onClick={handleSend} disabled={loading} className="bg-purple-600 text-white px-4 rounded">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}