import React, { useEffect, useState, useContext } from 'react';
import api from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';

export default function Billing() {
  const { user } = useContext(AuthContext);
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ patientId: '', items: [{ description: '', cost: 0, qty: 1 }] });
  const [message, setMessage] = useState(null);

  const load = async () => {
    try {
      const resBills = await api.get('http://localhost:4400/api/bills');
      setBills(resBills.data);

      const resPats = await api.get('http://localhost:4100/api/patients/search?q=');
      setPatients(resPats.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { load(); }, []);

  const myPatientId = user?.role === 'patient'
    ? patients.find(p => p.contact?.email === user.email)?._id
    : null;

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', cost: 0, qty: 1 }] }));

  const changeItem = (idx, key, value) => {
    const items = [...form.items];
    items[idx][key] = key === 'cost' || key === 'qty' ? Number(value) : value;
    setForm({ ...form, items });
  };

  const createBill = async (e) => {
    e.preventDefault();
    try {
      await api.post('http://localhost:4400/api/bills', form);
      setMessage('Bill created');
      setForm({ patientId: '', items: [{ description: '', cost: 0, qty: 1 }] });
      load();
    } catch (err) {
      console.error(err);
      setMessage('Create failed');
    }
  };

  const pay = async (billId) => {
    const amount = prompt('Amount to pay (number)');
    if (!amount) return;
    try {
      await api.post(`http://localhost:4400/api/bills/${billId}/pay`, { amount: Number(amount), method: 'online' });
      setMessage('Payment recorded');
      load();
    } catch (err) {
      console.error(err);
      setMessage(err?.response?.data?.message || 'Pay failed');
    }
  };

  const displayedBills = user?.role === 'patient'
    ? bills.filter(b => b.patientId === myPatientId)
    : bills;

  const getPatientName = (id) => {
    const p = patients.find(pat => pat._id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  };

  return (
    <div>
      <h2>{user?.role === 'patient' ? 'My Bills' : 'Billing'}</h2>

      {user?.role !== 'patient' && (
        <form onSubmit={createBill} style={{ border: '1px solid #eee', padding: 12, marginBottom: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>Patient:</label>
            <select
              value={form.patientId}
              onChange={e => setForm({ ...form, patientId: e.target.value })}
              required
              style={{ padding: 8, width: '100%', maxWidth: 300 }}
            >
              <option value="">-- Select Patient --</option>
              {patients.map(p => (
                <option key={p._id} value={p._id}>
                  {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 8 }}>
            {form.items.map((it, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input placeholder="Desc" value={it.description} onChange={e => changeItem(idx, 'description', e.target.value)} />
                <input placeholder="Cost" type="number" value={it.cost} onChange={e => changeItem(idx, 'cost', e.target.value)} style={{ width: 120 }} />
                <input placeholder="Qty" type="number" value={it.qty} onChange={e => changeItem(idx, 'qty', e.target.value)} style={{ width: 80 }} />
              </div>
            ))}
          </div>
          <div>
            <button type="button" onClick={addItem}>Add item</button>
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit">Create Bill</button>
          </div>
        </form>
      )}

      {message && <div>{message}</div>}

      <div>
        <h3>Recent bills</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', background: '#f0f0f0' }}>
              <th style={{ padding: 8 }}>Patient</th>
              <th style={{ padding: 8 }}>Total</th>
              <th style={{ padding: 8 }}>Status</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedBills.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: 8 }}>{getPatientName(b.patientId)}</td>
                <td style={{ padding: 8 }}>{b.total?.toFixed?.(2) ?? b.total}</td>
                <td style={{ padding: 8 }}>{b.status}</td>
                <td style={{ padding: 8 }}>
                  <button onClick={() => pay(b._id)}>Pay</button>
                </td>
              </tr>
            ))}
            {displayedBills.length === 0 && <tr><td colSpan="4" style={{ padding: 8 }}>No bills</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
