import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const GoogleLoginButton = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = () => {
        setLoading(true);
        // Simulate Popup / Network Delay
        setTimeout(() => {
            const googleUser = {
                id: 999, // Specific ID for Google User
                name: "Google User",
                email: "google.user@gmail.com",
                role: "user",
                avatar: "https://lh3.googleusercontent.com/a/ACg8ocIq8d1-..." // Fake Google Avatar URL if needed
            };

            // In a real app, this would verify the token with backend. 
            // Here we just simulate a successful auth flow.
            login(googleUser);
            showToast('Welcome, Google User!', 'success');
            navigate('/');
            setLoading(false);
        }, 1500);
    };

    return (
        <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '12px',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: '#555',
                transition: 'background 0.2s'
            }}
            onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#f9f9f9')}
            onMouseOut={(e) => !loading && (e.currentTarget.style.background = 'white')}
        >
            {loading ? (
                <span>Connecting to Google...</span>
            ) : (
                <>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
                    <span>Sign in with Google</span>
                </>
            )}
        </button>
    );
};

export default GoogleLoginButton;
