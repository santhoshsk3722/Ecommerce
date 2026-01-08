import React from 'react';

const LoadingSpinner = () => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            background: 'var(--background)',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div className="spinner"></div>
            <style>{`
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 4px solid var(--surface-hover);
                    border-top: 4px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>Loading TechOrbit...</p>
        </div>
    );
};

export default LoadingSpinner;
