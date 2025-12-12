import React, { useEffect, useState } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

export default function Prescriptions() {
  const { user } = useContext(AuthContext);
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [newPres, setNewPres] = useState({
    patientId: '',
    items: [{ medicine: '', dosage: '', durationDays: 5 }]
  });
  const [message, setMessage] = useState(null);

  // Load Prescriptions and Patients
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Prescriptions
        const resPres = await api.get('http://localhost:4500/api/prescriptions');
        setList(resPres.data);

        // Fetch Patients (for names and dropdown)
        const resPat = await api.get('http://localhost:4100/api/patients/search?q=');
        setPatients(resPat.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Derive current patient's ID if user is a patient
  const myPatientId = user?.role === 'patient'
    ? patients.find(p => p.contact?.email === user.email)?._id
    : null;

  const handleAddItem = () => {
    setNewPres(prev => ({ ...prev, items: [...prev.items, { medicine: '', dosage: '', durationDays: 5 }] }));
  };

  const handleChangeItem = (idx, key, value) => {
    const items = [...newPres.items];
    items[idx][key] = value;
    setNewPres({ ...newPres, items });
  };

  const create = async (e) => {
    e.preventDefault();
    try {
      const payload = { patientId: newPres.patientId, items: newPres.items, notes: newPres.notes };
      const res = await api.post('http://localhost:4500/api/prescriptions', payload);
      setMessage('Prescription created');
      setList(prev => [res.data, ...prev]);
      setNewPres({ patientId: '', items: [{ medicine: '', dosage: '', durationDays: 5 }], notes: '' });
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Create failed');
    }
  };

  // Filter list for Patient role
  const displayedList = user?.role === 'patient'
    ? list.filter(p => p.patientId === myPatientId)
    : list;

  // Helper to get name
  const getPatientName = (id) => {
    const p = patients.find(pat => pat._id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  if (user?.role === 'desk') return <div>Access Denied</div>;

  return (
    <div>
      <h2>Prescriptions</h2>

      {/* Hide Form for Patients */}
      {user?.role !== 'patient' && (
        <form onSubmit={create} style={{ marginBottom: 12, border: '1px solid #eee', padding: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Patient:</label>
            <select
              value={newPres.patientId}
              onChange={e => setNewPres({ ...newPres, patientId: e.target.value })}
              required
              style={{ padding: 8, width: '100%', maxWidth: 300 }}
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName} ({p.contact?.email})
                </option>
              ))}
            </select>
          </div>

          {newPres.items.map((it, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input placeholder="Medicine" value={it.medicine} onChange={e => handleChangeItem(idx, 'medicine', e.target.value)} required />
              <input placeholder="Dosage" value={it.dosage} onChange={e => handleChangeItem(idx, 'dosage', e.target.value)} />
              <input placeholder="Duration (days)" type="number" value={it.durationDays} onChange={e => handleChangeItem(idx, 'durationDays', e.target.value)} style={{ width: 140 }} />
            </div>
          ))}

          <div>
            <button type="button" onClick={handleAddItem}>Add item</button>
          </div>

          <div style={{ marginTop: 8 }}>
            <textarea placeholder="Notes" value={newPres.notes || ''} onChange={e => setNewPres({ ...newPres, notes: e.target.value })} />
          </div>

          <div style={{ marginTop: 8 }}>
            <button type="submit">Create Prescription</button>
          </div>
          {message && <div style={{ marginTop: 8 }}>{message}</div>}
        </form>
      )}

      <div>
        <h3>{user?.role === 'patient' ? 'My Prescriptions' : 'Recent Prescriptions'}</h3>
        <ul>
          {displayedList.map((p, index) => (
            <li key={p._id} style={{ marginBottom: 8, padding: 8, borderBottom: '1px solid #eee' }}>
              <strong>#{index + 1}</strong> — <strong>{getPatientName(p.patientId)}</strong>
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {new Date(p.date).toLocaleString()} — {p.items.length} items
              </div>
              <ul style={{ marginTop: 4, paddingLeft: 20 }}>
                {p.items.map((it, i) => (
                  <li key={i}>{it.medicine} ({it.dosage}) - {it.durationDays} days</li>
                ))}
              </ul>
            </li>
          ))}
          {displayedList.length === 0 && <div>No prescriptions found.</div>}
        </ul>
      </div>
    </div>
  );
}
