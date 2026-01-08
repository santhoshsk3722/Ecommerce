/**
 * @file NavBar.jsx
 * @description Global Navigation Bar.
 * 
 * Contains links to main pages, the search bar, cart icon, and user profile menu.
 * Responsive design adapts to mobile and desktop views.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import VisualSearch from './VisualSearch';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';

const NavBar = () => {
    const { cartCount } = useCart();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    // UI States
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Refs for click outside detection
    const profileRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {

            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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
                    <span style={{ color: 'var(--text-main)' }}>Tech</span>
                    <span style={{ color: 'var(--accent)' }}>Orbit</span>
                </Link>

                <div className={`nav-search-wrapper ${location.pathname !== '/' ? 'hide-on-mobile' : ''}`}>
                    <VisualSearch />
                </div>

                <div className="navbar-actions" style={{ flexShrink: 0, zIndex: 1002, position: 'relative' }}>

                    {/* Notification Bell */}
                    {user && <NotificationDropdown />}

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
                        <div ref={profileRef} style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                            >
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden' }}>
                                    {user.avatar ? (
                                        <img src={user.avatar} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        user.name.charAt(0)
                                    )}
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
                                    zIndex: 2000
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
                    <ThemeToggle />
                </div>
            </div>
        </motion.nav >
    );
};

export default NavBar;

