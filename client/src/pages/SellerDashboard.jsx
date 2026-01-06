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
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            fetch(`${apiUrl}/api/products/seller/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setProducts(data.data);
                });
        }
    }, [user]);

    const handleDelete = (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
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
            <div>
                <h3 style={{ marginBottom: '25px', color: 'var(--text-secondary)' }}>My Products ({products.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '25px' }}>
                    {products.map(p => (
                        <div key={p.id} style={{ background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', boxShadow: 'var(--shadow-sm)' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{ height: '200px', width: '100%', padding: '20px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <img src={p.image} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</h4>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>${p.price.toFixed(2)}</span>
                                    <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '12px', background: (p.stock && p.stock < 5) ? '#fee2e2' : '#dcfce7', color: (p.stock && p.stock < 5) ? '#dc2626' : '#166534', fontWeight: '600' }}>
                                        Stock: {p.stock || '10+'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                                    <Link to={`/seller/product/edit/${p.id}`} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', background: 'var(--surface-hover)', color: 'var(--text-main)', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>Edit</Link>
                                    <button onClick={() => handleDelete(p.id)} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--surface)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🛍️</div>
                            <h3>No products listed yet</h3>
                            <p style={{ marginBottom: '20px' }}>Start selling by adding your first product.</p>
                            <Link to="/seller/add-product" className="btn btn-primary">Add Product</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
