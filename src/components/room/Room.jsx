// Room.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/Firebase';
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
} from 'firebase/firestore';
import './Room.css';

function Room() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const userId = user.uid;

  useEffect(() => {
    const userRef = doc(db, 'onlineUsers', userId);

    // Set user online
    setDoc(userRef, {
      email: user.email,
      uid: user.uid,
      lastActive: serverTimestamp(),
    }, { merge: true });

    // Remove user on unload
    const handleBeforeUnload = async () => {
      await deleteDoc(userRef);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Listen for users
    const unsub = onSnapshot(collection(db, 'onlineUsers'), (snapshot) => {
      const users = snapshot.docs
        .map((doc) => doc.data())
        .filter((u) => u.uid !== userId); // exclude self
      setOnlineUsers(users);
    });

    return () => {
      unsub();
      handleBeforeUnload();
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, user.email]);

  const handleChatStart = (otherUser) => {
    const roomId = [user.uid, otherUser.uid].sort().join('_');
    navigate(`/chat/${roomId}`, { state: { otherUser } });
  };

  const handleLogout = async () => {
    await deleteDoc(doc(db, 'onlineUsers', userId)); // clean up presence
    await logout();
    navigate('/');
  };

  return (
    <div className="room-container">
      <div className="room-header">
        <h2>Hi, {user.email.split('@')[0]}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <div className="user-list">
        <h3>Online Users:</h3>
        {onlineUsers.length === 0 ? (
          <p>No one online yet 😢</p>
        ) : (
          <ul>
            {onlineUsers.map((u) => (
              <li key={u.uid} className="user-card">
                <span>{u.email.split('@')[0]}</span>
                <button onClick={() => handleChatStart(u)}>Chat</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Room;
