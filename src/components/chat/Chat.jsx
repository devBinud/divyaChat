// Chat.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db } from '../../services/Firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

function Chat() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(state?.otherUser || null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!otherUser && user?.uid && roomId) {
      const getOtherUser = async () => {
        const [uid1, uid2] = roomId.split('_');
        const otherUid = uid1 === user.uid ? uid2 : uid1;

        try {
          const userDoc = await getDoc(doc(db, 'users', otherUid));
          if (userDoc.exists()) {
            setOtherUser(userDoc.data());
          }
        } catch (err) {
          console.error('Failed to fetch other user:', err);
        }
      };
      getOtherUser();
    }
  }, [roomId, user, otherUser]);

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    await addDoc(collection(db, 'rooms', roomId, 'messages'), {
      text: input,
      sender: user.uid,
      timestamp: serverTimestamp(),
    });

    setInput('');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat with {otherUser ? otherUser.email.split('@')[0] : '...'}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.sender === user.uid ? 'sent' : 'received'}`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
