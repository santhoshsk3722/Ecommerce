import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import defaultProductImg from '../assets/default-product.png';

const ProductCard = ({ product }) => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isWishlisted, setIsWishlisted] = useState(false);

    const toggleWishlist = (e) => {
        e.preventDefault();
        if (!user) return showToast('Login to add to wishlist');

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, product_id: product.id })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'added') {
                    setIsWishlisted(true);
                    showToast('Added to Wishlist');
                } else if (data.message === 'removed') {
                    setIsWishlisted(false);
                    showToast('Removed from Wishlist');
                }
            });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
            transition={{ duration: 0.3 }}
        >
            <Link to={`/product/${product.id}`} className="card product-card-container">
                <motion.button
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleWishlist}
                    style={{
                        position: 'absolute', top: '15px', right: '15px',
                        zIndex: 10, background: 'var(--surface)', borderRadius: '50%',
                        width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                        color: isWishlisted ? 'var(--error)' : 'var(--text-light)',
                        fontSize: '20px', border: '1px solid var(--border)'
                    }}
                >
                    ♥
                </motion.button>

                <div className="product-image-container">
                    <img src={product.image || defaultProductImg} onError={(e) => { e.target.onerror = null; e.target.src = defaultProductImg; }} alt={product.title} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', transition: 'transform 0.3s' }} />
                </div>

                <div className="product-info-container">
                    <div style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase', fontWeight: '600', marginBottom: '8px' }}>
                        {product.category}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {product.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '15px' }}>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>${product.price}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <span style={{ color: 'var(--warning)' }}>★</span> {product.rating}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
