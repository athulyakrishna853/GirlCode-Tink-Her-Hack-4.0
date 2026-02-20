'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, query, where, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      // Filter out the current logged-in user
      const userList = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.id !== auth.currentUser?.uid);
      setUsers(userList);
    };
    fetchUsers();
  }, []);

  const startChat = async (targetUser) => {
    const currentUserId = auth.currentUser.uid;
    const participantIds = [currentUserId, targetUser.id].sort(); // Sort to ensure consistent ID generation

    // Logic: Check if a chat already exists between these two
    const chatQuery = query(
      collection(db, "chats"),
      where("participantIds", "==", participantIds)
    );
    const existingChat = await getDocs(chatQuery);

    if (!existingChat.empty) {
      router.push(`/chat/${existingChat.docs[0].id}`);
    } else {
      // Create a new chat document
      const newChat = await addDoc(collection(db, "chats"), {
        participantIds,
        participants: [
          { uid: currentUserId, name: auth.currentUser.displayName },
          { uid: targetUser.id, name: targetUser.name }
        ],
        lastUpdatedAt: serverTimestamp(),
      });
      router.push(`/chat/${newChat.id}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Find a Skill Swap Partner</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <div key={user.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
            <div>
              <h2 className="font-semibold">{user.name}</h2>
              <p className="text-sm text-gray-600">Offers: {user.skillsOffered?.join(", ")}</p>
            </div>
            <button 
              onClick={() => startChat(user)}
              className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
s