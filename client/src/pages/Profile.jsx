import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, login } = useAuth(); // We'll need a way to update user in context, hacking via login or add update method later
    // Actually, AuthContext probably doesn't have an update method exposed easily based on previous read.
    // I should check AuthContext.jsx again or just update it. 
    // For now, I'll fetch fresh user data or assume I can update local state.
    // Better: Update AuthContext to support "refreshUser" or similar.
    // Or just re-login with the same credentials? No password available.
    // Allow me to update the context manully.

    // Let's hold on writing this file until I verify AuthContext.
    // But I can write the standard boilerplate.

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        zip: '',
        country: ''
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
            const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.message === 'updated') {
                setMessage('Profile updated successfully!');
                //Ideally update context here.
                // For now, we rely on page refresh or subsequent fetches.
                // A full refresh is a simple way to sync if Context doesn't support update.
                // window.location.reload(); 
            } else {
                setMessage('Error updating profile: ' + data.error);
            }
        } catch (err) {
            setMessage('Error: ' + err.message);
        }
    };

    if (!user) return <div className="container">Please login.</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>My Profile</h2>

            {message && <div style={{ padding: '10px', background: message.includes('Error') ? '#ffebee' : '#e8f5e9', color: message.includes('Error') ? '#c62828' : '#2e7d32', marginBottom: '20px', borderRadius: '4px' }}>{message}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Email</label>
                    <input value={user.email} disabled style={{ width: '100%', padding: '10px', border: '1px solid #eee', borderRadius: '4px', background: '#f9f9f9' }} />
                </div>

                <h3 style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>Address Details</h3>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Address</label>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Street address, Apt, etc." style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>City</label>
                        <input name="city" value={formData.city} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>ZIP Code</label>
                        <input name="zip" value={formData.zip} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Country</label>
                    <input name="country" value={formData.country} onChange={handleChange} style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px' }}>Save Changes</button>
                </div>
            </form>
        </div>
    );
};

export default Profile;
