
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const url = isLogin
            ? 'http://localhost:5000/api/login'
            : 'http://localhost:5000/api/signup';

        const body = isLogin
            ? { email, password }
            : { name, email, password };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                login(data.user);
                navigate('/');
            } else {
                setError(data.message || 'Authentication failed');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
            <div style={{ background: 'white', padding: '40px', width: '400px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{isLogin ? 'Login to E-Shop' : 'Create Account'}</h2>

                {error && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ padding: '12px', border: '1px solid #e0e0e0', outline: 'none' }}
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '12px', border: '1px solid #e0e0e0', outline: 'none' }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ padding: '12px', border: '1px solid #e0e0e0', outline: 'none' }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-secondary"
                        style={{ padding: '12px', boxSizing: 'border-box' }}
                    >
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
                    <span style={{ color: '#878787' }}>{isLogin ? 'New to E-Shop?' : 'Existing User?'}</span>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ background: 'transparent', color: 'var(--primary)', fontWeight: '500', marginLeft: '5px' }}
                    >
                        {isLogin ? 'Create an account' : 'Log in'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

