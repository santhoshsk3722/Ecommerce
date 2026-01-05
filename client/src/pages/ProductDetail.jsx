import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:5000/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setProduct(data.data);
                    // Fetch Related Products
                    fetch(`http://localhost:5000/api/products?category=${data.data.category}&excludeId=${id}&limit=4`)
                        .then(res => res.json())
                        .then(relData => {
                            if (relData.message === 'success') setRelatedProducts(relData.data);
                        });
                }
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading product details...</div>;
    if (!product) return <div className="container">Product not found</div>;

    return (
        <PageTransition>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 1fr', gap: '60px', marginBottom: '60px' }}>
                    {/* Image Section - Interactive Look */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                            background: 'white',
                            borderRadius: 'var(--radius-lg)',
                            padding: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: 'var(--shadow-lg)',
                            maxHeight: '600px'
                        }}
                    >
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                            src={product.image}
                            alt={product.title}
                            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
                        />
                    </motion.div>

                    {/* Details Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div style={{ marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent)', fontWeight: 'bold', fontSize: '14px' }}>
                            {product.category}
                        </div>
                        <h1 style={{ fontSize: '42px', fontWeight: '800', lineHeight: 1.2, marginBottom: '20px' }}>{product.title}</h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--success)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                                {product.rating} ★
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>Verified Reviews</span>
                        </div>

                        <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary)', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            ${product.price}
                            <span style={{ fontSize: '20px', color: 'var(--text-light)', textDecoration: 'line-through', fontWeight: 'normal' }}>
                                ${(product.price * 1.2).toFixed(2)}
                            </span>
                        </div>

                        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '40px' }}>
                            {product.description}
                        </p>

                        <div style={{ display: 'flex', gap: '20px' }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                className="btn btn-secondary"
                                style={{ flex: 1, padding: '20px', fontSize: '18px' }}
                            >
                                Add to Cart
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { addToCart(product); navigate('/cart'); }}
                                className="btn btn-primary"
                                style={{ flex: 1, padding: '20px', fontSize: '18px' }}
                            >
                                Buy Now
                            </motion.button>
                        </div>

                        {/* Trust Badges */}
                        <div style={{ display: 'flex', gap: '30px', marginTop: '40px', borderTop: '1px solid var(--border)', paddingTop: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <span>🚚</span> Free Shipping
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <span>🛡️</span> 2 Year Warranty
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
                                <span>↩️</span> 30 Day Returns
                            </div>
                        </div>
                    </motion.div>
                </div>

                <ReviewSection productId={product.id} />

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div style={{ marginTop: '80px', borderTop: '1px solid #eee', paddingTop: '40px' }}>
                        <h2 style={{ marginBottom: '30px' }}>You might also like</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
                            {relatedProducts.map(p => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/product/${p.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ background: 'white', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
                                        <img src={p.image} alt={p.title} style={{ width: '100%', height: '150px', objectFit: 'contain', marginBottom: '15px' }} />
                                        <h4 style={{ fontSize: '16px', margin: '0 0 10px 0', height: '40px', overflow: 'hidden' }}>{p.title}</h4>
                                        <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${p.price}</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
};

export default ProductDetail;
