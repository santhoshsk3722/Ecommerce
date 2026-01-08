import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            return;
        }

        setStatus('loading');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        try {
            const res = await fetch(`${apiUrl}/api/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: password })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Invalid or expired token');
            }
        } catch (err) {
            setStatus('error');
            setErrorMsg('Failed to connect to server');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', padding: '60px 20px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: '30px', borderRadius: '16px', background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Reset Password</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Create a new password.</p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🎉</div>
                        <h3 style={{ marginBottom: '10px' }}>Password Reset!</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                                {errorMsg}
                            </div>
                        )}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                required
                                minLength={6}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                required
                                minLength={6}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                        >
                            {status === 'loading' ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;

