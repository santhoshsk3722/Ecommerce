/**
 * @file Wishlist.jsx
 * @description User Wishlist.
 * 
 * Displays products saved by the user for later purchase.
 * Allows moving items to the cart or removing them.
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const Wishlist = () => {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchWishlist();
        }
    }, [user]);

    const fetchWishlist = async () => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/wishlist/${user.id}`);
            const data = await res.json();
            if (data.message === 'success') {
                setWishlistItems(data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (id) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            await fetch(`${apiUrl}/api/wishlist/${id}`, { method: 'DELETE' });
            setWishlistItems(prev => prev.filter(item => item.wishlist_id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        // Optional: Remove from wishlist after adding to cart
        // removeFromWishlist(product.wishlist_id);
    };

    if (!user) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Please login to view your wishlist.</div>;

    if (loading) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;

    return (
        <div className="container" style={{ padding: '20px 0 80px' }}>
            <h2 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Your Wishlist ({wishlistItems.length})</h2>

            {wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px', background: 'var(--surface)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>💔</div>
                    <h3>Your wishlist is empty</h3>
                    <p style={{ marginBottom: '20px' }}>Save items you love to revisit later.</p>
                    <Link to="/" className="btn btn-primary">Start Shopping</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                    {wishlistItems.map(item => (
                        <motion.div
                            key={item.wishlist_id}
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="card product-card"
                            style={{ position: 'relative' }}
                        >
                            <button
                                onClick={() => removeFromWishlist(item.wishlist_id)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'rgba(255,255,255,0.8)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '30px',
                                    height: '30px',
                                    cursor: 'pointer',
                                    zIndex: 10,
                                    fontSize: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                ✕
                            </button>
                            <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <img src={item.image} alt={item.title} style={{ width: '100%', aspectRatio: '1/1', objectFit: 'contain', background: '#f8fafc' }} />
                                <div style={{ padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 5px', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
                                    <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--primary)' }}>${item.price}</p>
                                </div>
                            </Link>
                            <div style={{ padding: '0 15px 15px' }}>
                                <button
                                    onClick={() => handleAddToCart(item)}
                                    className="btn btn-primary"
                                    style={{ width: '100%', fontSize: '13px', padding: '8px' }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;

