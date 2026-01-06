import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const { points, badges, history } = useLoyalty();

    const [formData, setFormData] = useState({
        name: '', address: '', city: '', zip: '', country: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                address: user.address || '',
                city: user.city || '',
                zip: user.zip || '',
                country: user.country || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.message === 'updated') {
                setMessage('Profile updated successfully!');
            } else {
                setMessage('Error: ' + data.error);
            }
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    if (!user) return <div className="container" style={{ padding: '40px' }}>Please login.</div>;

    // --- Analytics Chart Logic ---
    // Mock spending data for last 6 months
    const spendingData = [150, 450, 300, 600, 200, 800];
    const maxSpend = Math.max(...spendingData);
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
                        <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', fontSize: '20px' }}>Edit Profile</h2>
                        {message && <div style={{ padding: '10px', background: message.includes('Error') ? '#ffebee' : '#e8f5e9', color: message.includes('Error') ? '#c62828' : '#2e7d32', marginBottom: '20px', borderRadius: '4px', fontSize: '14px' }}>{message}</div>}

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Email</label>
                                <input value={user.email} disabled style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Address</label>
                                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>City</label>
                                    <input name="city" value={formData.city} onChange={handleChange} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>ZIP</label>
                                    <input name="zip" value={formData.zip} onChange={handleChange} />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Country</label>
                                <input name="country" value={formData.country} onChange={handleChange} />
                            </div>
                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Analytics & History */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {/* Spending Chart */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Spending Insights</h3>
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
                            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                        </div>
                    </div>

                    {/* Points History */}
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Points History</h3>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {history.length === 0 ? <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No history yet.</p> : (
                                <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {history.map((h, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                                <td style={{ padding: '10px 0', color: 'var(--text-secondary)' }}>{new Date(h.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '10px 0' }}>{h.reason}</td>
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
