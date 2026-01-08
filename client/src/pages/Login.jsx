import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import GoogleLoginButton from '../components/GoogleLoginButton';
import emailjs from '@emailjs/browser';

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

        // --- Email Flow ---
        if (authMethod === 'email') {
            // Login Mode: Direct API Call
            if (isLogin) {
                try {
                    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                    const res = await fetch(`${apiUrl}/api/login`, {
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
                return;
            }

            // Signup Mode: OTP Verification
            // Step 0: Send OTP
            if (phoneStep === 0) {
                const code = Math.floor(1000 + Math.random() * 9000).toString();
                // Store OTP in formData for verification (in a real app, hash this or use backend)
                // We'll leverage the 'phone' otp field or a new state. Let's use a temp variable stored in component? 
                // Better: simple state.

                const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
                const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
                const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

                if (!serviceId || !templateId || !publicKey) {
                    // Fallback for demo without keys
                    console.log(`DEMO OTP for ${formData.email}: ${code}`);
                    showToast(`Demo OTP: ${code} (Check Console)`, 'info');
                    setFormData(prev => ({ ...prev, generatedOtp: code }));
                    setPhoneStep(1); // Reusing phoneStep variable for "verification step"
                    return;
                }

                showToast('Sending Verification Code...', 'info');
                try {
                    await emailjs.send(serviceId, templateId, {
                        to_name: formData.name,
                        to_email: formData.email,
                        otp: code,
                        message: `Your verification code is ${code}`
                    }, publicKey);

                    showToast(`OTP sent to ${formData.email}`, 'success');
                    setFormData(prev => ({ ...prev, generatedOtp: code }));
                    setPhoneStep(1);
                } catch (error) {
                    console.error("EmailJS Failed, falling back to Demo:", error);
                    // Fallback to Demo Mode automatically
                    showToast(`Demo OTP: ${code} (Email Failed)`, 'info');
                    setFormData(prev => ({ ...prev, generatedOtp: code }));
                    setPhoneStep(1);
                }
            }
            // Step 1: Verify & Signup
            else {
                if (formData.otp === formData.generatedOtp) {
                    try {
                        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                        const res = await fetch(`${apiUrl}/api/signup`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
                        });
                        const data = await res.json();
                        if (data.message === 'success') {
                            login(data.user);
                            showToast(`Account Verified! Welcome!`, 'success');
                            navigate('/');
                        } else {
                            showToast(data.message || 'Signup Error', 'error');
                        }
                    } catch (err) {
                        showToast('Connection failed', 'error');
                    }
                } else {
                    showToast('Invalid OTP. Please try again.', 'error');
                }
            }
        }
        // --- Phone Flow (Legacy Demo) ---
        else {
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
                        <span style={{ color: 'var(--text-main)' }}>Tech</span>
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
            <div style={{ width: '45%', minWidth: '400px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                <div style={{ width: '100%', maxWidth: '380px' }}>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '40px', color: 'var(--text-main)' }}>
                        {authMethod === 'email' ? (isLogin ? 'Welcome back' : 'Create an account') : 'Phone Login'}
                    </h2>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                        <button onClick={() => setAuthMethod('email')} style={{ paddingBottom: '5px', border: 'none', background: 'none', borderBottom: authMethod === 'email' ? '2px solid #2563eb' : '2px solid transparent', color: authMethod === 'email' ? '#2563eb' : 'var(--text-light)', fontWeight: 'bold', cursor: 'pointer' }}>Email</button>
                        <button onClick={() => setAuthMethod('phone')} style={{ paddingBottom: '5px', border: 'none', background: 'none', borderBottom: authMethod === 'phone' ? '2px solid #2563eb' : '2px solid transparent', color: authMethod === 'phone' ? '#2563eb' : 'var(--text-light)', fontWeight: 'bold', cursor: 'pointer' }}>Phone Code</button>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {authMethod === 'email' && (
                            <>
                                {!isLogin && phoneStep === 0 && (
                                    <input type="text" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                                )}
                                {phoneStep === 0 ? (
                                    <>
                                        <input type="email" placeholder="Email address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                                        <input type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                                        <div style={{ textAlign: 'right', marginTop: '-10px' }}>
                                            <a href="/#/forgot-password" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>Forgot Password?</a>
                                        </div>
                                    </>
                                ) : (
                                    <input type="text" placeholder="Enter 4-digit OTP" required value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', letterSpacing: '4px', background: 'var(--surface)', fontSize: '20px' }} />
                                )}
                            </>
                        )}

                        {authMethod === 'phone' && (
                            phoneStep === 0 ?
                                <input type="tel" placeholder="Phone Number" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)' }} /> :
                                <input type="text" placeholder="Enter OTP (1234)" required value={formData.otp} onChange={e => setFormData({ ...formData, otp: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border)', textAlign: 'center', letterSpacing: '4px', background: 'var(--surface)' }} />
                        )}

                        <button className="btn btn-primary" style={{ padding: '15px', marginTop: '10px', fontSize: '16px', borderRadius: '8px' }}>
                            {authMethod === 'email' ?
                                (isLogin ? 'Sign In' : (phoneStep === 1 ? 'Verify & Create Account' : 'Get Verification Code'))
                                : (phoneStep === 0 ? 'Send Code' : 'Verify')}
                        </button>
                    </form>

                    {authMethod === 'email' && (
                        <div style={{ marginTop: '30px' }}>
                            <div style={{ width: '100%', height: '1px', background: '#e2e8f0', marginBottom: '30px', position: 'relative' }}>
                                <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: 'var(--surface)', padding: '0 10px', color: 'var(--text-light)', fontSize: '12px' }}>OR CONTINUE WITH</span>
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

