import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [errorMsg, setErrorMsg] = useState('');
    const [demoToken, setDemoToken] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setErrorMsg('');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        try {
            const res = await fetch(`${apiUrl}/api/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                setStatus('success');
                if (data.demo_token) setDemoToken(data.demo_token);
            } else {
                setStatus('error');
                setErrorMsg(data.error || 'Something went wrong');
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
                    <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Forgot Password?</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Enter your email to reset it.</p>
                </div>

                {status === 'success' ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>✅</div>
                        <h3 style={{ marginBottom: '10px' }}>Check your email</h3>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>We've sent a recovery link to <strong>{email}</strong>.</p>

                        {/* DEMO PURPOSES ONLY */}
                        {demoToken && (
                            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px', fontSize: '12px', color: '#b45309', marginBottom: '20px', wordBreak: 'break-all' }}>
                                <strong>[DEMO MODE]</strong><br />
                                Use this link: <Link to={`/reset-password/${demoToken}`}>Reset Link</Link>
                            </div>
                        )}

                        <Link to="/login" className="btn btn-secondary" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === 'error' && (
                            <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
                                {errorMsg}
                            </div>
                        )}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--background)' }}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '12px', fontSize: '16px' }}
                        >
                            {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Back to Login</Link>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;

