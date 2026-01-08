import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useAuth();
    const { points, badges, history } = useLoyalty();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '', address: '', city: '', zip: '', country: '', avatar: ''
    });
    const [message, setMessage] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [spendingData, setSpendingData] = useState([]);
    const [maxSpend, setMaxSpend] = useState(1);

    // New Address State
    const [newAddress, setNewAddress] = useState({
        name: '', address: '', city: '', zip: '', country: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                address: user.address || '',
                city: user.city || '',
                zip: user.zip || '',
                country: user.country || '',
                avatar: user.avatar || ''
            });
            fetchSpendingData(user.id);
            fetchAddresses(user.id);
        }
    }, [user]);

    const fetchAddresses = async (userId) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/addresses/${userId}`);
            const data = await res.json();
            if (data.message === 'success') setAddresses(data.data);
        } catch (err) {
            console.error("Failed to fetch addresses", err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAddress, user_id: user.id })
            });
            const data = await res.json();
            if (data.message === 'success') {
                setMessage('Address added!');
                setShowAddressForm(false);
                setNewAddress({ name: '', address: '', city: '', zip: '', country: '' });
                fetchAddresses(user.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteAddress = async (id) => {
        if (!confirm('Delete this address?')) return;
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            await fetch(`${apiUrl}/api/addresses/${id}`, { method: 'DELETE' });
            fetchAddresses(user.id);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchSpendingData = async (userId) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/orders/user/${userId}`);
            const data = await res.json();

            if (data.message === 'success') {
                const orders = data.data;
                // Aggregate by month (simple last 6 months logic)
                const monthlySpend = new Array(6).fill(0);
                const months = [];
                const today = new Date();

                for (let i = 5; i >= 0; i--) {
                    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                    months.push(d.toLocaleString('default', { month: 'short' }));
                }

                orders.forEach(order => {
                    const d = new Date(order.date || order.created_at); // Fallback to date column
                    const diffMonths = (today.getFullYear() - d.getFullYear()) * 12 + (today.getMonth() - d.getMonth());
                    if (diffMonths >= 0 && diffMonths < 6) {
                        monthlySpend[5 - diffMonths] += order.total;
                    }
                });

                setSpendingData(monthlySpend);
                const max = Math.max(...monthlySpend, 1);
                setMaxSpend(max);
            }
        } catch (err) {
            console.error("Failed to fetch spending data", err);
            // Fallback to mock if failed
            setSpendingData([0, 0, 0, 0, 0, 0]);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Resize image to max 100x100 to save DB space
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = 100;
                    canvas.height = 100;
                    ctx.drawImage(img, 0, 0, 100, 100);
                    const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    setFormData(prev => ({ ...prev, avatar: resizedBase64 }));
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.message === 'updated') {
                setMessage('Profile updated successfully!');
                setIsEditing(false);
                // Update local user context so Navbar reflects changes immediately
                login({ ...user, ...formData });
            } else {
                setMessage('Error: ' + data.error);
            }
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    if (!user) return <div className="container" style={{ padding: '40px' }}>Please login.</div>;

    const chartPoints = spendingData.map((val, i) => `${i * 100},${150 - (val / maxSpend * 120)}`).join(' ');

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>

                {/* Left Column: Profile & Rewards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Rewards Card */}
                    <div className="card" style={{ padding: '25px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', border: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '18px', margin: 0 }}>TechCoins Balance</h3>
                            <span style={{ fontSize: '24px' }}>🪙</span>
                        </div>
                        <div style={{ fontSize: '42px', fontWeight: '800', margin: '15px 0' }}>{points}</div>
                        <div style={{ fontSize: '13px', opacity: 0.8 }}>worth ${(points / 10).toFixed(2)} in discounts</div>

                        <div style={{ marginTop: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', opacity: 0.7 }}>Earned Badges</div>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {badges.map(b => (
                                    <span key={b} style={{ background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '15px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.3)' }}>
                                        🏆 {b}
                                    </span>
                                ))}
                                {badges.length === 0 && <span style={{ fontSize: '12px', fontStyle: 'italic', opacity: 0.5 }}>No badges yet</span>}
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ position: 'relative', width: '80px', height: '80px' }}>
                                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 'bold', overflow: 'hidden', border: '3px solid var(--surface)' }}>
                                        {formData.avatar ? (
                                            <img src={formData.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            user.name?.charAt(0)
                                        )}
                                    </div>
                                    {isEditing && (
                                        <label style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            right: '-5px',
                                            background: 'var(--text-main)',
                                            color: 'var(--surface)',
                                            width: '30px',
                                            height: '30px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            border: '2px solid var(--surface)',
                                            boxShadow: 'var(--shadow-sm)'
                                        }} title="Change Photo">
                                            📷
                                            <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                        </label>
                                    )}
                                </div>
                                <div>
                                    <h2 style={{ fontSize: '24px', margin: 0, color: 'var(--text-main)' }}>{formData.name}</h2>
                                    <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{user.email}</p>
                                </div>
                            </div>
                            {!isEditing ? (
                                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }} title="Edit Profile">✏️</button>
                            ) : (
                                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-secondary)' }} title="Cancel">✕</button>
                            )}
                        </div>

                        {message && <div style={{ padding: '10px', background: message.includes('Error') ? '#ffebee' : '#e8f5e9', color: message.includes('Error') ? '#c62828' : '#2e7d32', marginBottom: '20px', borderRadius: '4px', fontSize: '14px' }}>{message}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Name</label>
                                {isEditing ? (
                                    <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }} />
                                ) : (
                                    <div style={{ padding: '10px', fontWeight: '600', color: 'var(--text-main)' }}>{formData.name}</div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px', color: 'var(--text-secondary)' }}>Email</label>
                                <div style={{ padding: '10px', background: 'var(--surface-hover)', borderRadius: '8px', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>{user.email}</div>
                            </div>

                            {isEditing && (
                                <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                    <button type="submit" className="btn btn-primary">Save Profile Info</button>
                                </div>
                            )}
                        </form>

                        {/* Address Book Section */}
                        <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)' }}>Address Book</h3>
                                <button onClick={() => setShowAddressForm(!showAddressForm)} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
                                    {showAddressForm ? 'Cancel' : '+ Add New'}
                                </button>
                            </div>

                            {showAddressForm && (
                                <form onSubmit={handleAddAddress} style={{ background: 'var(--surface-hover)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
                                    <div style={{ display: 'grid', gap: '10px' }}>
                                        <input placeholder="Location Name (e.g. Home, Office)" value={newAddress.name} onChange={e => setNewAddress({ ...newAddress, name: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <input placeholder="Address Line" value={newAddress.address} onChange={e => setNewAddress({ ...newAddress, address: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <input placeholder="City" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                            <input placeholder="ZIP Code" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        </div>
                                        <input placeholder="Country" value={newAddress.country} onChange={e => setNewAddress({ ...newAddress, country: e.target.value })} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }} />
                                        <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>Save Address</button>
                                    </div>
                                </form>
                            )}

                            <div style={{ display: 'grid', gap: '15px' }}>
                                {addresses.map(addr => (
                                    <div key={addr.id} style={{ padding: '15px', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-main)' }}>{addr.name}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{addr.address}, {addr.city} {addr.zip}, {addr.country}</div>
                                        </div>
                                        <button onClick={() => handleDeleteAddress(addr.id)} style={{ color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }}>🗑️</button>
                                    </div>
                                ))}
                                {addresses.length === 0 && <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>No saved addresses.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Analytics & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Spending Chart */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>Spending Insights (Last 6 Months)</h3>
                        <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                            <svg viewBox="0 0 500 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Axes */}
                                <line x1="0" y1="150" x2="500" y2="150" stroke="var(--border)" />
                                <line x1="0" y1="0" x2="0" y2="150" stroke="var(--border)" />

                                {/* Area */}
                                <polygon points={`0,150 ${chartPoints} 500,150`} fill="var(--accent)" fillOpacity="0.1" />

                                {/* Line */}
                                <polyline
                                    points={chartPoints}
                                    fill="none"
                                    stroke="var(--accent)"
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                />

                                {/* Points */}
                                {spendingData.map((val, i) => (
                                    <circle key={i} cx={i * 100} cy={150 - (val / maxSpend * 120)} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
                                ))}
                            </svg>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', color: 'var(--text-light)', fontSize: '12px' }}>
                            {['Mon-5', 'Mon-4', 'Mon-3', 'Mon-2', 'Mon-1', 'Current'].map((m, i) => <span key={i}>{m}</span>)}
                        </div>
                    </div>

                    {/* Points History */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>Points History</h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {history.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No history yet.</p> : (
                                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {history.map((h, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{new Date(h.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '10px 0', color: 'var(--text-main)' }}>{h.reason}</td>
                                                <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 'bold', color: h.amount > 0 ? 'var(--success)' : '#ef4444' }}>
                                                    {h.amount > 0 ? '+' : ''}{h.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

