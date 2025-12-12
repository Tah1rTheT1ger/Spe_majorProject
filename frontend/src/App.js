import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Prescriptions from './pages/Prescriptions';
import Appointments from './pages/Appointments';
import Billing from './pages/Billing';
import Scans from './pages/Scans';
import Header from './components/Header';
import { AuthContext } from './contexts/AuthContext';

export default function App() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <Header />
      <main style={{ padding: 20 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/register" replace />} />
          <Route path="/patients" element={user ? <Patients /> : <Navigate to="/login" replace />} />
          <Route path="/patients/:patientId/scans" element={user ? <Scans /> : <Navigate to="/login" replace />} />
          <Route path="/scans" element={user ? <Scans /> : <Navigate to="/login" replace />} />
          <Route path="/prescriptions" element={user ? <Prescriptions /> : <Navigate to="/login" replace />} />
          <Route path="/appointments" element={user ? <Appointments /> : <Navigate to="/login" replace />} />
          <Route path="/billing" element={user ? <Billing /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
