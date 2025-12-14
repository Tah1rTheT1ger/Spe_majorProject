import React, { useEffect, useState, useContext } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';

export default function Appointments() {
  const { token, user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    scheduledAt: '',
    durationMinutes: 30,
    reason: ''
  });
  const [message, setMessage] = useState(null);

  const fetchData = async () => {
    if (!token) return; // Wait for token
    setLoading(true);
    try {
      const [apptRes, patRes, docRes] = await Promise.all([
        api.get('http://localhost:4300/api/appointments'),
        api.get('http://localhost:4100/api/patients/search?q='), // Use search endpoint
        api.get('http://localhost:4000/api/auth/doctors') // Assuming this endpoint exists based on prev tasks
      ]);
      setList(apptRes.data);
      setPatients(patRes.data);
      setDoctors(docRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      await api.post('http://localhost:4300/api/appointments', payload);
      setMessage('Appointment created');
      setForm({ patientId: '', doctorId: '', scheduledAt: '', durationMinutes: 30, reason: '' });
      // Refresh appointments list only
      const res = await api.get('http://localhost:4300/api/appointments');
      setList(res.data);
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Create failed');
    }
  };

  // Helper to find name
  const getPatientName = (id) => {
    const p = patients.find(x => x._id === id);
    return p ? p.name : id;
  };

  const getDoctorName = (id) => {
    const d = doctors.find(x => x._id === id);
    return d ? d.name : id;
  };

  const pageStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const formStyle = {
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    marginBottom: '32px',
    display: 'grid',
    gap: '16px'
  };

  const inputStyle = {
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%',
    boxSizing: 'border-box'
  };

  const btnStyle = {
    padding: '12px 24px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    justifySelf: 'start'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '16px',
    background: '#f8f9fa',
    borderBottom: '2px solid #eee',
    fontWeight: '600',
    color: '#2c3e50'
  };

  const tdStyle = {
    padding: '16px',
    borderBottom: '1px solid #eee',
    color: '#555'
  };

  return (
    <div style={pageStyle}>
      <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#2c3e50' }}>Appointments</h2>

      {user?.role !== 'patient' && (
        <form onSubmit={submit} style={formStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Patient</label>
              <select
                value={form.patientId}
                onChange={e => setForm({ ...form, patientId: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select Patient</option>
                {patients.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.contact?.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Doctor</label>
              <select
                value={form.doctorId}
                onChange={e => setForm({ ...form, doctorId: e.target.value })}
                required
                style={inputStyle}
              >
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduledAt}
                onChange={e => setForm({ ...form, scheduledAt: e.target.value })}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Duration (Min)</label>
              <input
                type="number"
                placeholder="30"
                value={form.durationMinutes}
                onChange={e => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Reason</label>
            <input
              placeholder="Checkup, Follow-up, etc."
              value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: '8px' }}>
            <button type="submit" style={btnStyle}>Create Appointment</button>
            {message && <span style={{ marginLeft: '16px', color: message.includes('failed') ? 'red' : 'green' }}>{message}</span>}
          </div>
        </form>
      )}

      <div>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#34495e' }}>Upcoming Schedule</h3>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Time</th>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Doctor</th>
              <th style={thStyle}>Reason</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map(a => (
              <tr key={a._id} style={{ transition: 'background 0.2s' }}>
                <td style={tdStyle}>{new Date(a.scheduledAt).toLocaleDateString()}</td>
                <td style={tdStyle}>{new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                <td style={tdStyle}>{getPatientName(a.patientId)}</td>
                <td style={tdStyle}>{getDoctorName(a.doctorId)}</td>
                <td style={tdStyle}>{a.reason || '-'}</td>
                <td style={tdStyle}>
                  <span style={{
                    background: a.status === 'completed' ? '#d5f5e3' : '#fdebd0',
                    color: a.status === 'completed' ? '#2ecc71' : '#f39c12',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {a.status}
                  </span>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="6" style={{ ...tdStyle, textAlign: 'center', padding: '32px' }}>
                  No appointments scheduled.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
