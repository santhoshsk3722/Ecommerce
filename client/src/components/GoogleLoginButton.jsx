import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleLoginButton = () => {
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            setLoading(true);
            try {
                // Fetch user info from Google
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${codeResponse.access_token}` },
                });
                const googleUser = await userInfoRes.json();

                // Send to backend for verification/creation
                const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                const backendRes = await fetch(`${apiUrl}/api/google-login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: googleUser.email,
                        name: googleUser.name,
                        picture: googleUser.picture,
                        google_id: googleUser.sub
                    })
                });

                const data = await backendRes.json();
                if (data.message === 'success') {
                    login(data.user);
                    showToast(`Welcome, ${data.user.name}!`, 'success');
                    navigate('/');
                } else {
                    showToast('Google Login Failed: ' + data.error, 'error');
                }
            } catch (error) {
                console.error("Google Login Error:", error);
                showToast('Google Login Failed', 'error');
            } finally {
                setLoading(false);
            }
        },
        onError: (error) => {
            console.error("Google Login Failed:", error);
            showToast('Google Login Failed', 'error');
        }
    });

    return (
        <button
            type="button"
            onClick={() => handleGoogleLogin()}
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

