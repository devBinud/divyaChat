// Chat.js
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { db, storage } from '../../services/Firebase';
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
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useAuth } from '../../context/AuthContext';
import './Chat.css';

function Chat() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(state?.otherUser || null);
  const [selectedImages, setSelectedImages] = useState([]);
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

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
  };

  const sendMessage = async () => {
    if (input.trim()) {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: input,
        sender: user.uid,
        timestamp: serverTimestamp(),
      });
      setInput('');
    }

    for (let image of selectedImages) {
      const storageRef = ref(storage, `chatImages/${Date.now()}_${image.name}`);
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        imageUrl: downloadURL,
        sender: user.uid,
        timestamp: serverTimestamp(),
      });
    }

    setSelectedImages([]);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        Chat with {otherUser ? otherUser.email.split('@')[0] : '...'}
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-bubble ${msg.sender === user.uid ? 'sent' : 'received'}`}>
            {msg.text && <p>{msg.text}</p>}
            {msg.imageUrl && <img src={msg.imageUrl} alt="Sent" className="chat-image" />}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <label className="image-upload-button">
          📷
          <input
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
          />
        </label>

        {selectedImages.length > 0 && (
          <div className="image-count">{selectedImages.length} selected</div>
        )}

        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
