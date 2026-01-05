import React, { useState } from 'react';
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
                    <Link to="/wishlist" style={{ color: 'var(--text-secondary)' }}>Wishlist</Link>

                    {user ? (
                        <>
                            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {user.name.charAt(0)}
                                </div>
                                <span>{user.name.split(' ')[0]}</span>
                            </div>

                            {user.role === 'admin' && <Link to="/admin" style={{ color: 'var(--warning)' }}>Admin</Link>}
                            {user.role === 'seller' && <Link to="/seller" style={{ color: 'var(--warning)' }}>Seller</Link>}
                            <Link to="/orders" style={{ color: 'var(--text-secondary)' }}>Orders</Link>
                            <button onClick={logout} style={{ color: 'var(--error)', background: 'transparent' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Login</Link>
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
                </div>
            </div>
        </motion.nav>
    );
};

export default NavBar;
