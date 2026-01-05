import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
    const [usersList, setUsersList] = useState([]);

    useEffect(() => {
        if (user && user.role === 'admin') {
            // Fetch Stats
            fetch('http://localhost:5000/api/stats')
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setStats(data.data);
                });

            // Fetch Users
            fetch('http://localhost:5000/api/users')
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setUsersList(data.data);
                });
        }
    }, [user]);

    if (!user || user.role !== 'admin') return <div className="container">Access Denied</div>;

    const handleDeleteUser = (id) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
        fetch(`http://localhost:5000/api/users/${id}`, { method: 'DELETE' })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'deleted') {
                    setUsersList(usersList.filter(u => u.id !== id));
                } else {
                    alert('Error: ' + data.error);
                }
            });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '30px' }}>Admin Dashboard</h2>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#2874f0', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '36px', margin: '0 0 10px 0' }}>{stats.users}</h3>
                    <div>Total Users</div>
                </div>
                <div style={{ background: '#fb641b', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '36px', margin: '0 0 10px 0' }}>{stats.products}</h3>
                    <div>Products</div>
                </div>
                <div style={{ background: '#26a541', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '36px', margin: '0 0 10px 0' }}>{stats.orders}</h3>
                    <div>Orders</div>
                </div>
                <div style={{ background: '#878787', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '36px', margin: '0 0 10px 0' }}>${stats.revenue.toFixed(0)}</h3>
                    <div>Total Revenue</div>
                </div>
            </div>

            {/* Users List */}
            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
                <h3 style={{ padding: '20px', background: '#f5f5f5', margin: 0, borderBottom: '1px solid #e0e0e0' }}>Platform Users</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
                            <th style={{ padding: '15px' }}>ID</th>
                            <th style={{ padding: '15px' }}>Name</th>
                            <th style={{ padding: '15px' }}>Email</th>
                            <th style={{ padding: '15px' }}>Role</th>
                            <th style={{ padding: '15px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                <td style={{ padding: '15px' }}>#{u.id}</td>
                                <td style={{ padding: '15px', fontWeight: '500' }}>{u.name}</td>
                                <td style={{ padding: '15px', color: '#878787' }}>{u.email}</td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        background: u.role === 'admin' ? '#333' : u.role === 'seller' ? '#fb641b' : '#e0e0e0',
                                        color: u.role === 'user' ? 'black' : 'white',
                                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', textTransform: 'capitalize'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    {u.role !== 'admin' && (
                                        <button
                                            onClick={() => handleDeleteUser(u.id)}
                                            style={{ background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
