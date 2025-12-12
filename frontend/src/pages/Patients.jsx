import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/apiClient';
import { AuthContext } from '../contexts/AuthContext';
import PatientForm from '../components/PatientForm';

export default function Patients() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [q, setQ] = useState('');

  if (user?.role === 'patient') {
    return <div style={{ padding: 20 }}>Access Denied. You cannot view other patients.</div>;
  }
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState(null);

  const search = async () => {
    setLoading(true);
    try {
      const res = await api.get(`http://localhost:4100/api/patients/search?q=${encodeURIComponent(q)}`);
      setPatients(res.data);
    } catch (err) {
      console.error(err);
      setMessage('Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search(); // initial
    // eslint-disable-next-line
  }, []);

  const handleCreate = async (payload) => {
    try {
      const res = await api.post('http://localhost:4100/api/patients', payload);
      setMessage('Patient created');
      setCreating(false);
      setPatients(prev => [res.data, ...prev]);
    } catch (err) {
      console.error(err);
      setMessage('Create failed');
    }
  };

  // Styles
  const containerStyle = {
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  };

  const headerRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  };

  const titleStyle = {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2c3e50',
    margin: 0
  };

  const searchContainerStyle = {
    display: 'flex',
    gap: '12px',
    flex: 1,
    maxWidth: '600px',
    marginLeft: '24px'
  };

  const inputStyle = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #dfe6e9',
    fontSize: '1rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  };

  const btnStyle = {
    padding: '12px 24px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#3498db',
    color: 'white',
    boxShadow: '0 4px 6px rgba(52, 152, 219, 0.2)'
  };

  const secondaryBtnStyle = {
    ...btnStyle,
    background: '#ecf0f1',
    color: '#2c3e50',
    boxShadow: 'none',
    border: '1px solid #bdc3c7'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #f0f0f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const avatarStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#3498db',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    marginBottom: '8px'
  };

  const actionBtnStyle = {
    flex: 1,
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #3498db',
    background: 'white',
    color: '#3498db',
    fontWeight: '600',
    cursor: 'pointer',
    textAlign: 'center',
    marginTop: '12px',
    transition: 'all 0.2s'
  };

  return (
    <div style={containerStyle}>
      <div style={headerRowStyle}>
        <h2 style={titleStyle}>Patients</h2>
        <div style={searchContainerStyle}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, or phone..."
            style={inputStyle}
          />
          <button onClick={search} style={btnStyle}>Search</button>
        </div>
        <button onClick={() => setCreating(c => !c)} style={secondaryBtnStyle}>
          {creating ? 'Cancel' : '+ New Patient'}
        </button>
      </div>

      {creating && (
        <div style={{ marginBottom: '32px', padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <PatientForm onSubmit={handleCreate} />
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading patients...</div> : (
        <>
          {message && <div style={{ marginBottom: '16px', color: message.includes('failed') ? '#e74c3c' : '#2ecc71' }}>{message}</div>}

          <div style={gridStyle}>
            {patients.map(p => (
              <div
                key={p._id}
                style={cardStyle}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={avatarStyle}>
                    {p.firstName[0]}{p.lastName[0]}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#2c3e50' }}>{p.firstName} {p.lastName}</h3>
                    <div style={{ fontSize: '0.9rem', color: '#95a5a6' }}>Born: {p.dob ? new Date(p.dob).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#34495e' }}>
                  📧 {p.contact?.email || 'N/A'}<br />
                  📞 {p.contact?.phone || 'N/A'}
                </div>

                <button
                  onClick={() => navigate(`/patients/${p._id}/scans`)}
                  style={actionBtnStyle}
                  onMouseEnter={e => {
                    e.target.style.background = '#3498db';
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = 'white';
                    e.target.style.color = '#3498db';
                  }}
                >
                  View Scans
                </button>
              </div>
            ))}
          </div>

          {patients.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: '#bdc3c7' }}>
              <h3>No patients found.</h3>
              <p>Try a different search or create a new patient.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
