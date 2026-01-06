import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';

const NavBar = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    // UI States
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const onSearchSubmit = (e) => {
        e.preventDefault();
        console.log("Searching for:", searchTerm);
        navigate(`/?search=${searchTerm}`);
    };
    useEffect(() => {
        if (user && user.id) {
            const fetchNotifs = () => {
                const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                fetch(`${apiUrl}/api/notifications/${user.id}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.message === 'success') setNotifications(data.data);
                    });
            };
            fetchNotifs();
            const interval = setInterval(fetchNotifs, 10000); // Poll every 10s
            return () => clearInterval(interval);
        }
    }, [user]);

    if (location.pathname === '/login') return null;

    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="glass-panel"
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                marginBottom: 'var(--spacing-lg)'
            }}
        >
            <div className="container navbar-container">
                <Link to="/" className="navbar-brand">
                    <span style={{ color: 'var(--primary)' }}>Tech</span>
                    <span style={{ color: 'var(--accent)' }}>Orbit</span>
                </Link>

                <div className="search-form-container">
                    <form onSubmit={onSearchSubmit} className="search-form">
                        <span style={{ color: '#2874f0', fontSize: '18px', marginRight: '10px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Data-Driven Search for Products, Brands and More"
                            className='search-input'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent', fontSize: '14px', color: '#333', minWidth: 0 }}
                        />
                        {/* Voice Search Button */}
                        <button
                            type="button"
                            onClick={() => {
                                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                if (SpeechRecognition) {
                                    const recognition = new SpeechRecognition();
                                    recognition.start();
                                    recognition.onresult = (event) => {
                                        let speechToText = event.results[0][0].transcript;
                                        // Clean up punctuation (common in voice input like "phones.")
                                        speechToText = speechToText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
                                        setSearchTerm(speechToText);
                                        navigate(`/?search=${speechToText}`);
                                    };
                                } else {
                                    alert("Voice search not supported in this browser.");
                                }
                            }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                            title="Voice Search"
                        >
                            🎤
                        </button>
                    </form>
                </div>

                <div className="navbar-actions">

                    {/* Notification Bell */}
                    {user && (
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifs(!showNotifs)}>
                            <span style={{ fontSize: '20px' }}>🔔</span>
                            {notifications.filter(n => !n.is_read).length > 0 && (
                                <span style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {notifications.filter(n => !n.is_read).length}
                                </span>
                            )}
                            {showNotifs && (
                                <div style={{ position: 'absolute', top: '100%', right: 0, width: '300px', background: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', boxShadow: 'var(--shadow-lg)', zIndex: 100 }}>
                                    <strong>Notifications</strong>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '10px' }}>
                                        {notifications.length === 0 && <div style={{ padding: '10px', color: '#888' }}>No notifications</div>}
                                        {notifications.map(n => (
                                            <div key={n.id} style={{ padding: '8px', borderBottom: '1px solid #eee', fontSize: '13px', background: n.is_read ? 'white' : '#f9f9f9' }}>
                                                {n.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <Link to="/cart" style={{ position: 'relative', padding: '8px' }}>
                        <span style={{ fontSize: '20px' }}>🛒</span>
                        {cartCount > 0 && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '-8px',
                                    background: '#ef4444', // Bright Red
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '20px',
                                    height: '20px',
                                    fontSize: '11px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    zIndex: 10,
                                    border: '2px solid white'
                                }}
                            >
                                {cartCount}
                            </motion.span>
                        )}
                    </Link>

                    {user ? (
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                    {user.name.charAt(0)}
                                </div>
                            </div>

                            {showProfileMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '120%',
                                    right: 0,
                                    background: 'var(--surface)',
                                    minWidth: '200px',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-lg)',
                                    border: '1px solid var(--border)',
                                    padding: '10px 0',
                                    zIndex: 100
                                }}>
                                    <Link to="/profile" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }} className="menu-item">Profile</Link>
                                    <Link to="/orders" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }} className="menu-item">My Orders</Link>
                                    <Link to="/wishlist" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--text-main)', textDecoration: 'none', transition: 'background 0.2s' }} className="menu-item">Wishlist</Link>

                                    {user.role === 'admin' && (
                                        <Link to="/admin" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--warning)', textDecoration: 'none', fontWeight: 'bold' }} className="menu-item">Admin Dashboard</Link>
                                    )}
                                    {user.role === 'seller' && (
                                        <Link to="/seller" onClick={() => setShowProfileMenu(false)} style={{ display: 'block', padding: '10px 20px', color: 'var(--warning)', textDecoration: 'none', fontWeight: 'bold' }} className="menu-item">Seller Dashboard</Link>
                                    )}

                                    <div style={{ borderTop: '1px solid var(--border)', margin: '5px 0' }}></div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setShowProfileMenu(false);
                                            navigate('/login');
                                        }}
                                        style={{ width: '100%', textAlign: 'left', padding: '10px 20px', background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                                        className="menu-item"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Login</Link>
                    )}

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', padding: '5px', display: 'flex', alignItems: 'center' }}
                        title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                </div>
            </div>
        </motion.nav >
    );
};

export default NavBar;
