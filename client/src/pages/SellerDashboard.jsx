import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

const SellerDashboard = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({ title: '', price: '', category: '', image: '', description: '' });

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

    const handleSubmit = (e) => {
        e.preventDefault();
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, seller_id: user.id })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    showToast('Product added successfully!');
                    setFormData({ title: '', price: '', category: '', image: '', description: '' });
                    // Refresh
                    fetch(`${apiUrl}/api/products/seller/${user.id}`)
                        .then(res => res.json())
                        .then(data => setProducts(data.data));
                } else {
                    showToast(data.error || 'Failed to add product', 'error');
                }
            });
    };

    if (!user || user.role !== 'seller') return <div className="container">Access Denied</div>;

    return (
        <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Seller Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <a href="/seller/orders" className="btn btn-secondary" style={{ padding: '10px 20px', textDecoration: 'none' }}>Manage Orders</a>
                    <button className="btn btn-primary" style={{ padding: '10px 20px' }}>+ Add Product</button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px' }}>

                {/* Add Product Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0', height: 'fit-content' }}>
                    <h3 style={{ marginBottom: '15px' }}>Add New Product</h3>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            placeholder="Title"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <input
                            placeholder="Category"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <input
                            placeholder="Image URL"
                            value={formData.image}
                            onChange={e => setFormData({ ...formData, image: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <textarea
                            placeholder="Description"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                        />
                        <input
                            type="number"
                            placeholder="Stock Quantity"
                            value={formData.stock || ''}
                            onChange={e => setFormData({ ...formData, stock: e.target.value })}
                            required
                            style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        />
                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>List Product</button>
                    </form>
                </div>

                {/* Product List */}
                <div>
                    <h3 style={{ marginBottom: '15px' }}>My Products</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {products.map(p => (
                            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <img src={p.image} alt={p.title} style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
                                    <div>
                                        <div style={{ fontWeight: 'bold' }}>{p.title}</div>
                                        <div style={{ color: '#878787' }}>${p.price.toFixed(2)}</div>
                                        <div style={{ fontSize: '12px', color: (p.stock && p.stock < 5) ? 'red' : 'green', fontWeight: '600' }}>
                                            {(p.stock !== undefined) ? `Stock: ${p.stock}` : 'Stock: 10+'}
                                            {(p.stock && p.stock < 5) && " (Low Stock!)"}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <Link to={`/seller/product/edit/${p.id}`} className="btn btn-secondary" style={{ padding: '5px 10px', textDecoration: 'none', fontSize: '14px' }}>Edit</Link>
                                    <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', background: '#ff6161', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                        {products.length === 0 && <div style={{ color: '#878787' }}>No products listed yet.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SellerDashboard;
