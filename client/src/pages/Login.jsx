import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [authMethod, setAuthMethod] = useState('email'); // 'email', 'phone', 'google_sim'
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Steps for Phone Auth: 0=Input, 1=OTP
    const [phoneStep, setPhoneStep] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (authMethod === 'email') {
            const endpoint = isLogin ? '/api/login' : '/api/signup';
            try {
                const res = await fetch(`http://localhost:5000${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.message === 'success') {
                    login(data.user);
                    showToast(`Welcome ${data.user.name.split(' ')[0]}!`);
                    navigate(data.user.role === 'seller' ? '/seller' : data.user.role === 'admin' ? '/admin' : '/');
                } else {
                    showToast(data.message || 'Error', 'error');
                }
            } catch (err) {
                showToast('Connection failed', 'error');
            }
        } else if (authMethod === 'phone') {
            if (phoneStep === 0) {
                // Simulate sending OTP
                if (formData.phone.length < 10) return showToast('Invalid Phone Number', 'error');
                showToast(`OTP sent to ${formData.phone}`);
                setPhoneStep(1);
            } else {
                // Verify OTP (Check for '1234')
                if (formData.otp === '1234') {
                    // Simulate Login
                    login({ id: 999, name: 'Phone User', email: 'phone@user.com', role: 'user' });
                    showToast(`Welcome Phone User!`);
                    navigate('/');
                } else {
                    showToast('Invalid OTP', 'error');
                }
            }
        }
    };

    const handleGoogleLogin = () => {
        // Simulate Google Popup Delay
        setTimeout(() => {
            login({ id: 888, name: 'Google User', email: 'google@gmail.com', role: 'user' });
            showToast(`Logged in with Google`);
            navigate('/');
        }, 1500);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)', width: '100%', maxWidth: '400px' }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '30px', fontWeight: '800' }}>
                    {authMethod === 'email' ? (isLogin ? 'Welcome Back' : 'Create Account') :
                        authMethod === 'phone' ? 'Phone Login' : 'Google Login'}
                </h2>

                {/* Auth Method Tabs */}
                {authMethod !== 'google_sim' && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                        <button onClick={() => setAuthMethod('email')} style={{ flex: 1, padding: '8px', borderRadius: '4px', background: authMethod === 'email' ? 'var(--primary)' : '#f0f0f0', color: authMethod === 'email' ? 'white' : 'black', fontWeight: 'bold' }}>Email</button>
                        <button onClick={() => setAuthMethod('phone')} style={{ flex: 1, padding: '8px', borderRadius: '4px', background: authMethod === 'phone' ? 'var(--primary)' : '#f0f0f0', color: authMethod === 'phone' ? 'white' : 'black', fontWeight: 'bold' }}>Phone</button>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {authMethod === 'email' && (
                        <>
                            {!isLogin && (
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            )}
                            <input
                                type="email"
                                placeholder="Email Address"
                                required
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </>
                    )}

                    {authMethod === 'phone' && (
                        <>
                            {phoneStep === 0 ? (
                                <input
                                    type="tel"
                                    placeholder="Phone Number (10 digits)"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc' }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder="Enter OTP (Use 1234)"
                                    required
                                    maxLength="4"
                                    value={formData.otp}
                                    onChange={e => setFormData({ ...formData, otp: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '4px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '5px', fontSize: '20px' }}
                                />
                            )}
                        </>
                    )}

                    <button className="btn btn-primary" style={{ padding: '12px' }}>
                        {authMethod === 'email' ? (isLogin ? 'Login' : 'Sign Up') :
                            authMethod === 'phone' ? (phoneStep === 0 ? 'Send OTP' : 'Verify & Login') : ''}
                    </button>
                </form>

                {/* Google Login Button */}
                {authMethod === 'email' && (
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ textAlign: 'center', color: '#888', marginBottom: '10px', fontSize: '14px' }}>- OR -</div>
                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid #ddd', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontWeight: 'bold', color: '#444' }}
                        >
                            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" style={{ width: '20px' }} />
                            Continue with Google
                        </button>
                    </div>
                )}

                {authMethod === 'email' && (
                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </span>
                    </p>
                )}

                {authMethod === 'phone' && (
                    <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--primary)', cursor: 'pointer' }} onClick={() => { setAuthMethod('email'); setPhoneStep(0); }}>
                        Back to Email Login
                    </p>
                )}
            </motion.div>
        </div>
    );
};

export default Login;
