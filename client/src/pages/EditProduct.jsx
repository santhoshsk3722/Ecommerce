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
        fetch(`http://localhost:5000/api/products/${id}`)
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
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
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
        <div style={{ maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Product</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input name="title" value={formData.title} onChange={handleChange} placeholder="Product Title" required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price" required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }} />
                <select name="category" value={formData.category} onChange={handleChange} required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Audio">Audio</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home">Home</option>
                </select>
                <input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" required style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />

                <button type="submit" className="btn btn-primary" style={{ padding: '12px', marginTop: '10px' }}>Update Product</button>
            </form>
        </div>
    );
};

export default EditProduct;
