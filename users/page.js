// 'use client';
// import { useState, useEffect } from 'react';
// import { db, auth } from '../lib/firebase';
// import { collection, getDocs, query, where, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';
// import { useRouter } from 'next/navigation';

// export default function UserDirectory() {
//   const [users, setUsers] = useState([]);
//   const router = useRouter();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       const querySnapshot = await getDocs(collection(db, "users"));
//       // Filter out the current logged-in user
//       const userList = querySnapshot.docs
//         .map(doc => ({ id: doc.id, ...doc.data() }))
//         .filter(user => user.id !== auth.currentUser?.uid);
//       setUsers(userList);
//     };
//     fetchUsers();
//   }, []);

//   const startChat = async (targetUser) => {
//     const currentUserId = auth.currentUser.uid;
//     const participantIds = [currentUserId, targetUser.id].sort(); // Sort to ensure consistent ID generation

//     // Logic: Check if a chat already exists between these two
//     const chatQuery = query(
//       collection(db, "chats"),
//       where("participantIds", "==", participantIds)
//     );
//     const existingChat = await getDocs(chatQuery);

//     if (!existingChat.empty) {
//       router.push(`/chat/${existingChat.docs[0].id}`);
//     } else {
//       // Create a new chat document
//       const newChat = await addDoc(collection(db, "chats"), {
//         participantIds,
//         participants: [
//           { uid: currentUserId, name: auth.currentUser.displayName },
//           { uid: targetUser.id, name: targetUser.name }
//         ],
//         lastUpdatedAt: serverTimestamp(),
//       });
//       router.push(`/chat/${newChat.id}`);
//     }
//   };

//   return (
//     <div className="p-8 max-w-4xl mx-auto">
//       <h1 className="text-2xl font-bold mb-6">Find a Skill Swap Partner</h1>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {users.map(user => (
//           <div key={user.id} className="border p-4 rounded-lg flex justify-between items-center bg-white shadow-sm">
//             <div>
//               <h2 className="font-semibold">{user.name}</h2>
//               <p className="text-sm text-gray-600">Offers: {user.skillsOffered?.join(", ")}</p>
//             </div>
//             <button 
//               onClick={() => startChat(user)}
//               className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition"
//             >
//               Chat
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// s















'use client';
import { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const userList = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          // Filter out yourself so you don't chat with yourself
          .filter(user => user.id !== auth.currentUser?.uid);
        setUsers(userList);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const startChat = (targetUser) => {
    const currentUserId = auth.currentUser?.uid;
    
    if (!currentUserId) {
      alert("Please log in first!");
      return;
    }

    // 1. Generate the unique ID by sorting both UIDs
    // This matches what your ChatClient expects!
    const convId = [currentUserId, targetUser.id].sort().join("_");

    // 2. Redirect straight to the chat page
    // Your ChatClient handles the "ensureConversation" logic, so we don't need it here!
    router.push(`/chat/${convId}`);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-pink-600">Find a Skill Swap Partner</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.length === 0 ? (
          <p>Finding other women to swap skills with...</p>
        ) : (
          users.map(user => (
            <div key={user.id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-sm hover:shadow-md transition">
              <div>
                <h2 className="font-bold text-gray-800">{user.name || "Anonymous User"}</h2>
                <p className="text-sm text-gray-600">
                  Offers: <span className="text-pink-500 font-medium">
                    {user.skillsOffered ? user.skillsOffered.join(", ") : "No skills listed"}
                  </span>
                </p>
              </div>
              <button 
                onClick={() => startChat(user)}
                className="bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition font-semibold"
              >
                Chat
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}