import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const Footer = () => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            showToast('Thank you for subscribing!', 'success');
            setEmail('');
        }
    };

    const location = useLocation();

    if (location.pathname.startsWith('/login')) return null;

    return (
        <footer style={{ background: '#172337', color: 'white', paddingTop: '60px', paddingBottom: '30px', marginTop: 'auto' }}>
            <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>

                {/* Brand & Newsletter */}
                <div>
                    <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: 'var(--primary)' }}>Tech</span>
                        <span style={{ color: 'var(--accent)' }}>Orbit</span>
                    </h2>
                    <p style={{ color: '#c2c2c2', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                        The ultimate destination for premium tech, gadgets, and lifestyle products. Quality guaranteed.
                    </p>
                    <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="email"
                            placeholder="Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ padding: '10px', borderRadius: '4px', border: 'none', width: '100%', fontSize: '14px' }}
                            required
                        />
                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>Subscribe</button>
                    </form>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', color: '#878787', textTransform: 'uppercase' }}>Shop</h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <li><Link to="/" style={{ color: 'white' }}>All Products</Link></li>
                        <li><Link to="/?category=smartphones" style={{ color: 'white' }}>Smartphones</Link></li>
                        <li><Link to="/?category=laptops" style={{ color: 'white' }}>Laptops</Link></li>
                        <li><Link to="/?category=fragrances" style={{ color: 'white' }}>Fragrances</Link></li>
                        <li><Link to="/?category=skincare" style={{ color: 'white' }}>Skincare</Link></li>
                    </ul>
                </div>

                {/* Account & Help */}
                <div>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', color: '#878787', textTransform: 'uppercase' }}>Support</h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
                        <li><Link to="/profile" style={{ color: 'white' }}>My Account</Link></li>
                        <li><Link to="/orders" style={{ color: 'white' }}>Track Order</Link></li>
                        <li><Link to="/wishlist" style={{ color: 'white' }}>Wishlist</Link></li>
                        <li><span style={{ color: '#c2c2c2', cursor: 'pointer' }}>Return Policy</span></li>
                        <li><span style={{ color: '#c2c2c2', cursor: 'pointer' }}>FAQ</span></li>
                    </ul>
                </div>

                {/* Contact */}
                <div style={{ paddingLeft: '20px', borderLeft: '1px solid #454d5e' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '16px', color: '#878787', textTransform: 'uppercase' }}>Contact Us</h3>
                    <div style={{ fontSize: '14px', lineHeight: '2', color: '#c2c2c2' }}>
                        <p>TechOrbit Pvt Ltd</p>
                        <p>Bengaluru, Karnataka, India</p>
                        <p>support@techorbit.com</p>
                        <p>+91 1234 567 890</p>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', fontSize: '20px' }}>
                            <span>🐦</span>
                            <span>📘</span>
                            <span>📷</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ borderTop: '1px solid #283955', marginTop: '40px', paddingTop: '20px', textAlign: 'center', fontSize: '13px', color: '#878787' }}>
                &copy; {new Date().getFullYear()} TechOrbit. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
