import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getScansByPatient, uploadScan, deleteScan } from '../api/scans';
import ScanCard from '../components/ScanCard';
import { AuthContext } from '../contexts/AuthContext';
import api from '../api/apiClient';

export default function Scans() {
    const { patientId: paramPatientId } = useParams();
    const { token, user } = useContext(AuthContext);
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Patient Selection State
    const [selectedPatientId, setSelectedPatientId] = useState(paramPatientId || '');
    const [patients, setPatients] = useState([]);

    // Upload Form State
    const [file, setFile] = useState(null);
    const [type, setType] = useState('xray');
    const [description, setDescription] = useState('');

    useEffect(() => {
        // Fetch patients if we need to select one (not patient role, and maybe no param)
        const loadPatients = async () => {
            if (user?.role !== 'patient' && token) {
                try {
                    const res = await api.get('http://localhost:4100/api/patients/search?q='); // Use search endpoint
                    setPatients(res.data);
                } catch (err) {
                    console.error("Failed to load patients", err);
                }
            }
        };
        loadPatients();
    }, [user, token]);

    // Update selected patient if param changes
    useEffect(() => {
        if (paramPatientId) setSelectedPatientId(paramPatientId);
    }, [paramPatientId]);

    // Identify user's patient ID if they are a patient
    useEffect(() => {
        const setSelfPatientId = async () => {
            if (user?.role === 'patient' && !paramPatientId) {
                try {
                    const patRes = await api.get(`http://localhost:4100/api/patients/user/${user.id}`);
                    if (patRes.data) {
                        setSelectedPatientId(patRes.data._id);
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };
        setSelfPatientId();
    }, [user, paramPatientId]);

    const fetchScans = async () => {
        if (!selectedPatientId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await getScansByPatient(selectedPatientId);
            setScans(res.data);
        } catch (err) {
            console.error(err);
            setError('Failed to load scans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPatientId) fetchScans();
        else setScans([]);
        // eslint-disable-next-line
    }, [selectedPatientId]);

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file || !selectedPatientId) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('patientId', selectedPatientId);
        formData.append('type', type);
        formData.append('description', description);

        setUploading(true);
        try {
            await uploadScan(formData);
            setShowUpload(false);
            setFile(null);
            setDescription('');
            fetchScans(); // refresh
        } catch (err) {
            console.error(err);
            alert('Upload failed: ' + (err.response?.data?.error || err.message));
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this scan?')) return;
        try {
            await deleteScan(id);
            setScans(prev => prev.filter(s => s._id !== id));
        } catch (err) {
            alert('Delete failed');
        }
    };

    // Styles
    const pageStyle = {
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
    };

    const titleStyle = {
        fontSize: '2rem',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '0.5rem'
    };

    const subtitleStyle = {
        color: '#7f8c8d'
    };

    const btnStyle = {
        padding: '12px 24px',
        borderRadius: '8px',
        border: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: '#3498db',
        color: 'white',
        boxShadow: '0 4px 6px rgba(52, 152, 219, 0.2)'
    };

    const backBtnStyle = {
        textDecoration: 'none',
        color: '#3498db',
        fontSize: '0.9rem',
        display: 'flex',
        alignItems: 'center',
        marginBottom: '1rem'
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px'
    };

    const modalOverlayStyle = {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(5px)'
    };

    const modalStyle = {
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    };

    const inputGroupStyle = {
        marginBottom: '16px',
        textAlign: 'left'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '500',
        color: '#34495e'
    };

    const inputStyle = {
        width: '100%',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #dfe6e9',
        fontSize: '1rem',
        boxSizing: 'border-box'
    };

    const selectorStyle = {
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #dfe6e9',
        fontSize: '1rem',
        marginBottom: '20px',
        minWidth: '300px'
    };

    // if (loading) return <div style={{ ...pageStyle, textAlign: 'center', marginTop: 100 }}>Loading scans...</div>;
    // if (error) return <div style={{ ...pageStyle, color: 'red' }}>{error} <Link to="/patients">Back</Link></div>;

    return (
        <div style={pageStyle}>
            <Link to="/patients" style={backBtnStyle}>← Back to Patients</Link>

            <div style={headerStyle}>
                <div>
                    <h1 style={titleStyle}>Patient Scans</h1>
                    <div style={subtitleStyle}>Manage medical imagery and reports.</div>
                </div>
                {selectedPatientId && (
                    <button
                        style={btnStyle}
                        onClick={() => setShowUpload(true)}
                        onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
                    >
                        + Upload New Scan
                    </button>
                )}

            </div>

            {/* Patient Selector for non-patients */}
            {user?.role !== 'patient' && !paramPatientId && (
                <div style={{ marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
                    <label style={{ fontWeight: 600, marginRight: '10px' }}>Select Patient to View Scans:</label>
                    <select
                        value={selectedPatientId}
                        onChange={e => setSelectedPatientId(e.target.value)}
                        style={selectorStyle}
                    >
                        <option value="">-- Select Patient --</option>
                        {patients.map(p => (
                            <option key={p._id} value={p._id}>{p.firstName} {p.lastName} ({p.contact?.email})</option>
                        ))}
                    </select>
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', marginTop: 40 }}>Loading...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : !selectedPatientId ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#95a5a6' }}>
                    Please select a patient to view scans.
                </div>
            ) : scans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', background: '#f8f9fa', borderRadius: '12px' }}>
                    <h3 style={{ color: '#95a5a6' }}>No scans found for this patient.</h3>
                    <p style={{ color: '#bdc3c7' }}>Upload a new xray, MRI, or lab report to get started.</p>
                </div>
            ) : (
                <div style={gridStyle}>
                    {scans.map(scan => (
                        <ScanCard key={scan._id} scan={scan} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {showUpload && (
                <div style={modalOverlayStyle} onClick={() => setShowUpload(false)}>
                    <div style={modalStyle} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0, color: '#2c3e50' }}>Upload Scan</h2>
                        <form onSubmit={handleUpload}>
                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>File</label>
                                <input
                                    type="file"
                                    required
                                    onChange={e => setFile(e.target.files[0])}
                                    style={inputStyle}
                                />
                            </div>

                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Type</label>
                                <select
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    style={inputStyle}
                                >
                                    <option value="xray">X-Ray</option>
                                    <option value="mri">MRI</option>
                                    <option value="ct">CT Scan</option>
                                    <option value="lab-report">Lab Report</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div style={inputGroupStyle}>
                                <label style={labelStyle}>Description</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    style={{ ...inputStyle, minHeight: '80px' }}
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowUpload(false)}
                                    style={{ ...btnStyle, background: '#ecf0f1', color: '#7f8c8d' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    style={{ ...btnStyle, background: uploading ? '#95a5a6' : '#2ecc71' }}
                                >
                                    {uploading ? 'Uploading...' : 'Upload Scan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
