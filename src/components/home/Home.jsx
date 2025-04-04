import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/Firebase';
import './Home.css';

function Home() {
  const [isRegister, setIsRegister] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const fakeEmail = `${phone}@chatapp.com`; // use phone as email

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, fakeEmail, password);
      alert('Registered successfully');
      setIsRegister(false);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, fakeEmail, password);
      alert('Login successful');
      navigate('/room');
    } catch (error) {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Divyashree Chat 💬</h2>
        <p className="sub-text">{isRegister ? "Create an account" : "Login to continue"}</p>

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {isRegister ? (
          <button onClick={handleRegister}>Register</button>
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}

        <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: 'pointer', marginTop: '10px' }}>
          {isRegister ? "Already have an account? Login" : "Don't have an account? Register"}
        </p>
      </div>
    </div>
  );
}

export default Home;
