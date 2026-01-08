import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);

    useEffect(() => {
        if (user && user.role === 'seller') {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            fetch(`${apiUrl}/api/products/seller/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setProducts(data.data);
                });
        }
    }, [user]);

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/products/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'deleted') {
                    setProducts(products.filter(p => p.id !== id));
                    showToast('Product deleted', 'success');
                }
            });
    };

    if (!user || user.role !== 'seller') return <div className="container">Access Denied</div>;

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-main)' }}>Seller Dashboard</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/seller/orders" className="btn btn-secondary" style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>📦</span> Manage Orders
                    </Link>
                    <Link to="/seller/add-product" className="btn btn-primary" style={{ padding: '12px 25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>+</span> Add New Product
                    </Link>
                </div>
            </div>

            {/* Product Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {products.map(product => (
                    <div key={product.id} style={{ background: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                        <div style={{ height: '180px', padding: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={product.image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ padding: '15px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.title}</h3>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>${product.price}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Stock: {product.stock}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={() => navigate(`/seller/edit-product/${product.id}`)}
                                    style={{ flex: 1, padding: '8px', background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-main)' }}
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
                                >
                                    🗑
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {products.length === 0 && (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛍️</div>
                    <h3>No products listed yet</h3>
                    <p style={{ marginBottom: '20px' }}>Start selling by adding your first product.</p>
                    <Link to="/seller/add-product" className="btn btn-primary">Add Product</Link>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;

