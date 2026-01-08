import React from 'react';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
    const { cartCount } = useCart();
    const { user } = useAuth();

    return (
        <nav className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="icon">🏠</span>
                <span className="label">Home</span>
            </NavLink>

            <NavLink to="/visual-search" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="icon">📷</span>
                <span className="label">Lens</span>
            </NavLink>

            <NavLink to="/cart" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <div style={{ position: 'relative' }}>
                    <span className="icon">🛒</span>
                    {cartCount > 0 && (
                        <span className="badge">{cartCount}</span>
                    )}
                </div>
                <span className="label">Cart</span>
            </NavLink>

            <NavLink to={user ? "/profile" : "/login"} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <span className="icon">👤</span>
                <span className="label">{user ? 'Profile' : 'Login'}</span>
            </NavLink>
        </nav>
    );
};

export default BottomNav;

