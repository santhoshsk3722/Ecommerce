/**
 * @file EditProduct.jsx
 * @description Seller Product Editing.
 * 
 * Form for sellers to modify existing product details.
 * Pre-fills the form with current product data.
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EditProduct = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        description: '',
        category: '',
        image: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch product details
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/products/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setFormData(data.data);
                } else {
                    alert('Product not found');
                    navigate('/seller');
                }
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.message === 'updated') {
                alert('Product updated successfully');
                navigate('/seller');
            } else {
                alert('Error updating product: ' + data.error);
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    if (!user || user.role !== 'seller') return <div className="container">Access Denied</div>;
    if (loading) return <div className="container">Loading...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', background: 'var(--surface)', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Title</label>
                    <input name="title" value={formData.title} onChange={handleChange} placeholder="Product Title" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price ($)</label>
                        <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Stock Quantity</label>
                        <input name="stock" type="number" value={formData.stock || ''} onChange={handleChange} placeholder="Stock Quantity" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}>
                        <option value="">Select Category</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Audio">Audio</option>
                        <option value="Gaming">Gaming</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Home">Home</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Image URL</label>
                    <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)', minHeight: '100px' }} />
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>Update Product</button>
                    <button type="button" onClick={() => navigate('/seller')} className="btn btn-secondary" style={{ flex: 1, padding: '14px' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;

