import React, { useContext } from 'react';
import { getScanStreamUrl, getScanDownloadUrl } from '../api/scans';
import { AuthContext } from '../contexts/AuthContext';

export default function ScanCard({ scan, onDelete }) {
    const { _id, type, description, createdAt, originalName } = scan;
    const { token } = useContext(AuthContext);

    const cardStyle = {
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid #f0f0f0'
    };

    const handleMouseEnter = (e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    };

    const handleMouseLeave = (e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    };

    const typeBadgeStyle = {
        alignSelf: 'flex-start',
        background: '#e3f2fd',
        color: '#1976d2',
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
    };

    const titleStyle = {
        margin: 0,
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#2c3e50',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const dateStyle = {
        fontSize: '0.85rem',
        color: '#95a5a6',
        marginTop: 'auto' // push to bottom if flex column
    };

    const actionsStyle = {
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #f0f0f0'
    };

    const btnStyle = {
        flex: 1,
        padding: '8px',
        border: 'none',
        borderRadius: '6px',
        fontSize: '0.85rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'background 0.2s',
        textAlign: 'center',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const viewBtnStyle = {
        ...btnStyle,
        background: '#f8f9fa',
        color: '#2c3e50',
    };

    const downloadBtnStyle = {
        ...btnStyle,
        background: '#2ecc71',
        color: 'white',
    };

    const deleteBtnStyle = {
        ...btnStyle,
        background: '#fff',
        color: '#e74c3c',
        border: '1px solid #e74c3c',
        flex: 0 // smaller
    };

    // Append token to URLs
    const streamUrl = `${getScanStreamUrl(_id)}?token=${token}`;
    const downloadUrl = `${getScanDownloadUrl(_id)}?token=${token}`;

    return (
        <div
            style={cardStyle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={typeBadgeStyle}>{type || 'Scan'}</div>
            <h3 style={titleStyle} title={originalName}>{originalName}</h3>
            {description && <p style={{ fontSize: '0.9rem', color: '#555', margin: '4px 0' }}>{description}</p>}

            <div style={dateStyle}>
                {new Date(createdAt).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                })}
            </div>

            <div style={actionsStyle}>
                <a
                    href={streamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={viewBtnStyle}
                >
                    View
                </a>
                <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={downloadBtnStyle}
                >
                    Download
                </a>
                <button
                    onClick={() => onDelete(_id)}
                    style={deleteBtnStyle}
                    title="Delete Scan"
                >
                    🗑
                </button>
            </div>
        </div>
    );
}
