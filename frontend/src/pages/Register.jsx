import React, { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' });
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setOk(null);
    try {
      const res = await api.post('http://localhost:4000/api/auth/register', form);
      setOk('Registered. Redirecting to login...');
      setTimeout(() => navigate('/login'), 800);
    } catch (error) {
      console.error('register error', error);
      const msg = error?.response?.data?.message || error.message || 'Register failed';
      setErr(msg);
    }
  };

  return (
    <div style={{ maxWidth: 520, margin: '20px auto', padding: 16, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{ display: 'grid', gap: 8 }}>
        <input placeholder="Full Name of People" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="desk">Desk Bench Tested</option>
        </select>
        <button type="submit">Register</button>
        <p style={{ marginTop: 10 }}>
          Already a user? <span style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>Login</span>
        </p>
        {err && <div style={{ color: 'red' }}>{err}</div>}
        {ok && <div style={{ color: 'green' }}>{ok}</div>}
      </form >
    </div >
  );
}
