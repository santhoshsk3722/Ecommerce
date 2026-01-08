import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AddProduct = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [newItem, setNewItem] = useState({ title: '', price: '', category: 'electronics', image: '', description: '', stock: 10 });
    const [variants, setVariants] = useState([]); // [{ name: 'Size', options: 'S, M, L' }]
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAddVariant = () => {
        setVariants([...variants, { name: '', options: '' }]);
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const handleRemoveVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            // Process variants: "S, M, L" -> ["S", "M", "L"]
            const processedVariants = variants.map(v => ({
                name: v.name,
                options: v.options.split(',').map(o => o.trim()).filter(Boolean)
            })).filter(v => v.name && v.options.length > 0);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, seller_id: user.id, variants: processedVariants })
            });
            const data = await res.json();
            if (data.message === 'success') {
                alert('Product added successfully!');
                navigate('/seller');
            } else {
                alert('Failed to add product');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', background: 'var(--surface)', borderRadius: '12px', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ marginBottom: '25px', color: 'var(--text-main)' }}>Add New Product</h2>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* ... existing fields ... */}
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Product Title</label>
                    <input
                        placeholder="e.g. Wireless Headphones"
                        value={newItem.title}
                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Price ($)</label>
                        <input
                            type="number"
                            placeholder="99.99"
                            value={newItem.price}
                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Stock Quantity</label>
                        <input
                            type="number"
                            placeholder="10"
                            value={newItem.stock}
                            onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                        />
                    </div>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Category</label>
                    <select
                        value={newItem.category}
                        onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                    >
                        <option value="electronics">Electronics</option>
                        <option value="fashion">Fashion</option>
                        <option value="home">Home</option>
                        <option value="books">Books</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Image URL</label>
                    <input
                        placeholder="https://images.unsplash.com/..."
                        value={newItem.image}
                        onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                    />
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <label style={{ color: 'var(--text-secondary)' }}>Description</label>
                        <button
                            type="button"
                            onClick={async () => {
                                if (!newItem.title) {
                                    alert('Please enter a product title first');
                                    return;
                                }
                                setIsGenerating(true);
                                try {
                                    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                                    const res = await fetch(`${apiUrl}/api/ai/generate`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ title: newItem.title, category: newItem.category })
                                    });
                                    const data = await res.json();
                                    if (data.message === 'success') {
                                        setNewItem(prev => ({ ...prev, description: data.description }));
                                    }
                                } catch (err) {
                                    console.error(err);
                                    alert('AI Generation Failed');
                                } finally {
                                    setIsGenerating(false);
                                }
                            }}
                            disabled={isGenerating} // Assuming isGenerating state is added
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                opacity: isGenerating ? 0.7 : 1
                            }}
                        >
                            {isGenerating ? 'Thinking...' : '✨ AI Write'}
                        </button>
                    </div>
                    <textarea
                        rows="4"
                        placeholder="Describe your product manually or use AI..."
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)', transition: 'all 0.3s' }}
                    />
                </div>

                {/* Variants Section */}
                <div style={{ background: 'var(--surface-hover)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Product Variants</label>
                        <button type="button" onClick={handleAddVariant} style={{ fontSize: '12px', padding: '4px 8px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Add Variant</button>
                    </div>
                    {variants.map((v, index) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input
                                placeholder="Name (e.g. Size)"
                                value={v.name}
                                onChange={e => handleVariantChange(index, 'name', e.target.value)}
                                style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <input
                                placeholder="Options (S, M, L)"
                                value={v.options}
                                onChange={e => handleVariantChange(index, 'options', e.target.value)}
                                style={{ flex: 2, padding: '8px', borderRadius: '4px', border: '1px solid var(--border)' }}
                            />
                            <button type="button" onClick={() => handleRemoveVariant(index)} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                        </div>
                    ))}
                    {variants.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No variants added (e.g. Sizes, Colors).</p>}
                </div>

                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '14px' }}>Publish Product</button>
                    <button type="button" onClick={() => navigate('/seller')} className="btn btn-secondary" style={{ flex: 1, padding: '14px' }}>Cancel</button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;

