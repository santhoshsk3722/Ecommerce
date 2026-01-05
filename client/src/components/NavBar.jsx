import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const NavBar = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            navigate(`/?search=${searchTerm}`);
        }
    };

    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    useEffect(() => {
        if (user) {
            const fetchNotifs = () => {
                fetch(`http://localhost:5000/api/notifications/${user.id}`)
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
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
                <Link to="/" style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ color: 'var(--primary)' }}>Tech</span>
                    <span style={{ color: 'var(--accent)' }}>Orbit</span>
                </Link>

                <div style={{ flex: 1, maxWidth: '500px', margin: '0 20px' }}>
                    <div style={{
                        display: 'flex',
                        background: 'var(--background)',
                        borderRadius: 'var(--radius-full)',
                        padding: '8px 16px',
                        border: '1px solid var(--border)',
                        transition: 'box-shadow 0.2s'
                    }}>
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleSearch}
                            style={{
                                border: 'none',
                                outline: 'none',
                                width: '100%',
                                background: 'transparent',
                                fontSize: '14px'
                            }}
                        />
                        <span style={{ color: 'var(--text-light)' }}>🔍</span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontWeight: '600', fontSize: '14px' }}>

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
                                    top: '0px',
                                    right: '0px',
                                    background: 'var(--error)',
                                    color: 'white',
                                    borderRadius: '50%',
                                    width: '18px',
                                    height: '18px',
                                    fontSize: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold'
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
                                    background: 'white',
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

                                    <div style={{ borderTop: '1px solid #eee', margin: '5px 0' }}></div>
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
                </div>
            </div>
        </motion.nav >
    );
};

export default NavBar;
