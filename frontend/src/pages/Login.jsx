import React, { useContext, useState } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr(null);
    try {
      const res = await api.post('http://localhost:4000/api/auth/login', { email, password });
      // show actual response for debugging
      console.log('login response', res.data);
      login(res.data.token, res.data.user);
      navigate('/');
    } catch (error) {
      console.error('login error', error);
      const msg = error?.response?.data?.message || error.message || 'Login failed';
      setErr(msg);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '30px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Login</h2>
      <form onSubmit={handle} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit" style={{ padding: '8px 12px' }}>Login as your role</button>
        {err && <div style={{ color: 'red' }}>{err}</div>}
      </form>
    </div>
  );
}
