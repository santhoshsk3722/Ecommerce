import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [authMethod, setAuthMethod] = useState('email');
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', otp: '' });
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [phoneStep, setPhoneStep] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (authMethod === 'email') {
            const endpoint = isLogin ? '/api/login' : '/api/signup';
            try {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const data = await res.json();
                if (data.message === 'success') {
                    login(data.user);
                    showToast(`Welcome!`);
                    navigate(data.user.role === 'seller' ? '/seller' : data.user.role === 'admin' ? '/admin' : '/');
                } else {
                    showToast(data.message || 'Error', 'error');
                }
            } catch (err) {
                showToast('Connection failed', 'error');
            }
        } else {
            // Phone logic
            if (phoneStep === 0) {
                if (formData.phone.length < 10) return showToast('Invalid Phone', 'error');
                showToast(`OTP sent to ${formData.phone}`);
                setPhoneStep(1);
            } else {
                if (formData.otp === '1234') {
                    login({ id: 999, name: 'Phone User', email: 'phone@user.com', role: 'user' });
                    showToast(`Welcome!`);
                    navigate('/');
                } else showToast('Invalid OTP', 'error');
            }
        }
    };

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'fixed', top: 0, left: 0, zIndex: 2000 }}>
            {/* Left Side - Hero / Branding */}
            <div style={{ flex: 1, background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', color: 'white' }} className="login-hero">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <div style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ color: '#fff' }}>Tech</span>
                        <span style={{ color: '#3b82f6' }}>Orbit</span>
                    </div>
                    <h1 style={{ fontSize: '36px', lineHeight: '1.2', marginBottom: '30px', fontWeight: 'bold' }}>
                        Experience the Future <br /> of Shopping.
                    </h1>
                    <ul style={{ fontSize: '18px', color: '#94a3b8', lineHeight: '2' }}>
                        <li>✓ AI-Powered Recommendations</li>
                        <li>✓ Live Delivery Tracking</li>
                        <li>✓ Visual Search Technology</li>
                    </ul>
                </motion.div>
                {/* Decorative Circles */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '-10%', right: '50%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', filter: 'blur(60px)' }}></div>
            </div>

            {/* Right Side - Form */}
            <div style={{ width: '45%', minWidth: '400px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ width: '100%', maxWidth: '380px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', color: '#0f172a' }}>
                        {authMethod === 'email' ? (isLogin ? 'Welcome back' : 'Create an account') : 'Phone Login'}
                    </h2>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                        <button onClick={() => setAuthMethod('email')} style={{ paddingBottom: '5px', border: 'none', background: 'none', borderBottom: authMethod === 'email' ? '2px solid #2563eb' : '2px solid transparent', color: authMethod === 'email' ? '#2563eb' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Email</button>
                        <button onClick={() => setAuthMethod('phone')} style={{ paddingBottom: '5px', border: 'none', background: 'none', borderBottom: authMethod === 'phone' ? '2px solid #2563eb' : '2px solid transparent', color: authMethod === 'phone' ? '#2563eb' : '#94a3b8', fontWeight: 'bold', cursor: 'pointer' }}>Phone Code</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {authMethod === 'email' && (
                            <>
                                {!isLogin && (
                                    <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                )}
                                <input type="email" placeholder="Email address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                                <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                            </>
                        )}

                        {authMethod === 'phone' && (
                            phoneStep === 0 ?
                                <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} /> :
                                <input type="text" placeholder="Enter OTP (1234)" required value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', letterSpacing: '4px' }} />
                        )}

                        <button className="btn btn-primary" style={{ padding: '15px', marginTop: '10px', fontSize: '16px', borderRadius: '8px' }}>
                            {authMethod === 'email' ? (isLogin ? 'Sign In' : 'Sign Up') : (phoneStep === 0 ? 'Send Code' : 'Verify')}
                        </button>
                    </form>

                    {authMethod === 'email' && (
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ width: '100%', height: '1px', background: '#e2e8f0', marginBottom: '30px', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'white', padding: '0 10px', color: '#94a3b8', fontSize: '12px' }}>OR CONTINUE WITH</span>
                            </div>
                            <GoogleLoginButton />
                        </div>
                    )}

                    <p style={{ marginTop: '30px', textAlign: 'center', color: '#64748b' }}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"} <span onClick={() => setIsLogin(!isLogin)} style={{ color: '#2563eb', fontWeight: 'bold', cursor: 'pointer' }}>{isLogin ? 'Sign up' : 'Sign in'}</span>
                    </p>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .login-hero { display: none !important; }
                    .login-container { width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
