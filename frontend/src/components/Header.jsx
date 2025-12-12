import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px', background: '#0b5fff', color: 'white'
    }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ fontWeight: 'bold' }}>Medical ERP</div>
        <nav>
          <Link to="/" style={{ color: 'white', marginRight: 12 }}>Dashboard</Link>
          {user?.role !== 'patient' && (
            <Link to="/patients" style={{ color: 'white', marginRight: 12 }}>Patients</Link>
          )}
          {/* Assuming generic /scans route exists or will be added for 'My Scans' */}
          <Link to="/scans" style={{ color: 'white', marginRight: 12 }}>Scans</Link>
          {user?.role !== 'desk' && (
            <Link to="/prescriptions" style={{ color: 'white', marginRight: 12 }}>Prescriptions</Link>
          )}
          <Link to="/appointments" style={{ color: 'white', marginRight: 12 }}>Appointments</Link>
          <Link to="/billing" style={{ color: 'white' }}>Billing</Link>
        </nav>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {user ? (
          <>
            <div style={{ fontSize: 14 }}>{user.name} ({user.role})</div>
            <button onClick={onLogout} style={{ padding: '6px 10px', borderRadius: 4 }}>Logout</button>
          </>
        ) : (
          <div>
            <Link to="/login" style={{ color: 'white', marginRight: 8 }}>Login</Link>
            <Link to="/register" style={{ color: 'white' }}>Register</Link>
          </div>
        )}
      </div>
    </header>
  );
}
