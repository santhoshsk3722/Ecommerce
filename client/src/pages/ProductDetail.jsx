import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});

    useEffect(() => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setProduct(data.data);

                    // --- SMART HISTORY TRACKING ---
                    const history = JSON.parse(localStorage.getItem('viewHistory') || '[]');
                    // Remove duplicate if exists to push to top
                    const newHistory = history.filter(item => item.id !== data.data.id);
                    // Add current product to front
                    newHistory.unshift({ id: data.data.id, title: data.data.title, image: data.data.image, price: data.data.price, category: data.data.category });
                    // Keep max 10 items
                    if (newHistory.length > 10) newHistory.pop();
                    localStorage.setItem('viewHistory', JSON.stringify(newHistory));
                    // -----------------------------

                    // Fetch Related Products
                    fetch(`${apiUrl}/api/products?category=${data.data.category}&excludeId=${id}&limit=4`)
                        .then(res => res.json())
                        .then(relData => {
                            if (relData.message === 'success') setRelatedProducts(relData.data);
                        });
                }
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        if (user && id) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            fetch(`${apiUrl}/api/wishlist/${user.id}`)
                .then(res => res.json())
                .then(wData => {
                    if (wData.message === 'success') {
                        // Ensure ID comparison is safe (string vs number)
                        const inWishlist = wData.data.some(item => item.product_id == id || item.id == id);
                        setIsWishlisted(inWishlist);
                    }
                })
                .catch(err => console.error("Wishlist check failed", err));
        }
    }, [id, user]);


    const handleWishlistToggle = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        try {
            if (isWishlisted) {
                await fetch(`${apiUrl}/api/wishlist/remove/${user.id}/${product.id}`, { method: 'DELETE' });
                setIsWishlisted(false);
            } else {
                await fetch(`${apiUrl}/api/wishlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: user.id, product_id: product.id })
                });
                setIsWishlisted(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading product details...</div>;
    if (!product) return <div className="container">Product not found</div>;

    return (
        <PageTransition>
            {product && (
                <Helmet>
                    <title>{product.title} - TechOrbit</title>
                    <meta name="description" content={product.description?.substring(0, 160) || `Buy ${product.title} at the best price on TechOrbit.`} />
                </Helmet>
            )}
            <div className="container">
                <div className="responsive-grid-detail">
                    {/* Image Section - Interactive Look */}
                    <motion.div
                        className="product-detail-image-wrapper"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
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
                                {product.average_rating ? Number(product.average_rating).toFixed(1) : 'New'} ★
                            </div>
                            <span style={{ color: 'var(--text-secondary)' }}>
                                {product.review_count ? `${product.review_count} Verified Reviews` : 'No reviews yet'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div style={{ fontSize: '36px', fontWeight: '700', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                ${product.price}
                                <span style={{ fontSize: '20px', color: 'var(--text-light)', textDecoration: 'line-through', fontWeight: 'normal' }}>
                                    ${(product.price * 1.2).toFixed(2)}
                                </span>
                            </div>
                            <button
                                onClick={handleWishlistToggle}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '28px',
                                    color: isWishlisted ? 'var(--error)' : 'var(--text-light)',
                                    transition: 'transform 0.2s',
                                    padding: '10px'
                                }}
                                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                {isWishlisted ? '❤️' : '🤍'}
                            </button>
                        </div>

                        {/* AI SUMMARY BLOCK */}
                        <div style={{
                            background: 'var(--surface-hover)',
                            padding: '20px',
                            borderRadius: '12px',
                            borderLeft: '4px solid var(--accent)',
                            marginBottom: '30px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: 'var(--accent)', fontWeight: '800' }}>
                                <span>🤖 AI Verdict</span>
                            </div>
                            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                                "Customers love the <strong>build quality</strong> and <strong>value for money</strong>. Some verified users mentioned the <strong>shipping</strong> was faster than expected. Highly recommended for <strong>{product.category}</strong> enthusiasts."
                            </p>
                        </div>

                        <p style={{ fontSize: '18px', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '40px' }}>
                            {product.description}
                        </p>

                        <div style={{ display: 'flex', gap: '20px', flexDirection: 'column' }}>
                            {/* VARIANTS SELECTION */}
                            {product.variants && (() => {
                                let parsedVariants = [];
                                try {
                                    parsedVariants = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                                } catch (e) { parsedVariants = []; }

                                if (!parsedVariants || parsedVariants.length === 0) return null;

                                return (
                                    <div style={{ marginBottom: '25px', padding: '15px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        {parsedVariants.map((v, idx) => (
                                            <div key={idx} style={{ marginBottom: '15px' }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>{v.name}:</div>
                                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                    {v.options.map(opt => (
                                                        <button
                                                            key={opt}
                                                            onClick={() => setSelectedVariants(prev => ({ ...prev, [v.name]: opt }))}
                                                            style={{
                                                                padding: '6px 14px',
                                                                borderRadius: '20px',
                                                                border: selectedVariants[v.name] === opt ? '2px solid var(--primary)' : '1px solid var(--border)',
                                                                background: selectedVariants[v.name] === opt ? 'var(--primary)' : 'var(--surface-hover)',
                                                                color: selectedVariants[v.name] === opt ? 'white' : 'var(--text-main)',
                                                                cursor: 'pointer',
                                                                fontSize: '13px',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })()}

                            {/* Role Restriction Check */}
                            {user && (user.role === 'seller' || user.role === 'admin') ? (
                                <div style={{
                                    padding: '15px',
                                    background: 'var(--surface-hover)',
                                    color: 'var(--text-secondary)',
                                    borderRadius: '8px',
                                    textAlign: 'center',
                                    border: '1px solid var(--border)',
                                    fontSize: '14px'
                                }}>
                                    🔒 Signed in as {user.role.charAt(0).toUpperCase() + user.role.slice(1)}. <br />
                                    Please <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/login')}>login as a customer</span> to purchase.
                                </div>
                            ) : (
                                product.stock !== undefined && product.stock <= 0 ? (
                                    <div style={{
                                        padding: '15px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: 'var(--error)',
                                        borderRadius: '8px',
                                        textAlign: 'center',
                                        fontWeight: 'bold',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        🚫 Out of Stock
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                // Validate Variants
                                                let variantCount = 0;
                                                try {
                                                    const pv = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                                                    if (pv) variantCount = pv.length;
                                                } catch (e) { }

                                                if (variantCount > 0 && Object.keys(selectedVariants).length < variantCount) {
                                                    alert('Please select all options (Size, Color, etc.)');
                                                    return;
                                                }
                                                addToCart({ ...product, selectedVariants });
                                            }}
                                            className="btn btn-secondary"
                                            style={{ flex: 1, padding: '20px', fontSize: '18px' }}
                                        >
                                            Add to Cart
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                // Validate Variants
                                                let variantCount = 0;
                                                try {
                                                    const pv = typeof product.variants === 'string' ? JSON.parse(product.variants) : product.variants;
                                                    if (pv) variantCount = pv.length;
                                                } catch (e) { }

                                                if (variantCount > 0 && Object.keys(selectedVariants).length < variantCount) {
                                                    alert('Please select all options (Size, Color, etc.)');
                                                    return;
                                                }
                                                addToCart({ ...product, selectedVariants });
                                                navigate('/cart');
                                            }}
                                            className="btn btn-primary"
                                            style={{ flex: 1, padding: '20px', fontSize: '18px' }}
                                        >
                                            Buy Now
                                        </motion.button>
                                    </div>
                                )
                            )}
                            {product.stock !== undefined && product.stock > 0 && product.stock < 10 && (
                                <div style={{ color: 'var(--error)', fontSize: '14px', fontWeight: '600', textAlign: 'center' }}>
                                    🔥 Hurry! Only {product.stock} left in stock.
                                </div>
                            )}
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
                    <div style={{ marginTop: '80px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
                        <h2 style={{ marginBottom: '30px' }}>You might also like</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '30px' }}>
                            {relatedProducts.map(p => (
                                <motion.div
                                    key={p.id}
                                    whileHover={{ y: -5 }}
                                    onClick={() => navigate(`/product/${p.id}`)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ background: 'var(--surface)', borderRadius: '8px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', height: '100%' }}>
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

