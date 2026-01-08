import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminUsersTable = ({ users, setUsers }) => {
    const { user: currentUser } = useAuth();
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        if (userId === currentUser.id) {
            alert("You cannot delete yourself!");
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        try {
            const res = await fetch(`${apiUrl}/api/admin/users/${userId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.message === 'deleted') {
                showToast('User deleted successfully');
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                alert('Failed to delete user: ' + data.error);
            }
        } catch (err) {
            alert('Error deleting user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Registered Users ({users.length})</h3>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: 'var(--surface-hover)',
                        color: 'var(--text-main)'
                    }}
                />
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '10px' }}>ID</th>
                            <th style={{ padding: '10px' }}>Name</th>
                            <th style={{ padding: '10px' }}>Email</th>
                            <th style={{ padding: '10px' }}>Role</th>
                            <th style={{ padding: '10px' }}>Location</th>
                            <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>#{u.id}</td>
                                <td style={{ padding: '10px', fontWeight: '500' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                            {u.name.charAt(0).toUpperCase()}
                                        </div>
                                        {u.name}
                                    </div>
                                </td>
                                <td style={{ padding: '10px' }}>{u.email}</td>
                                <td style={{ padding: '10px' }}>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
                                        background: u.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                                        color: u.role === 'admin' ? '#d97706' : '#0284c7'
                                    }}>
                                        {u.role}
                                    </span>
                                </td>
                                <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{u.city || u.address ? (u.city || 'Unknown') : '-'}</td>
                                <td style={{ padding: '10px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                    {u.role !== 'admin' && (
                                        <>
                                            <select
                                                value={u.role}
                                                onChange={async (e) => {
                                                    const newRole = e.target.value;
                                                    if (!window.confirm(`Promote ${u.name} to ${newRole}?`)) return;

                                                    const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
                                                    try {
                                                        const res = await fetch(`${apiUrl}/api/admin/users/${u.id}/role`, {
                                                            method: 'PUT',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ role: newRole })
                                                        });
                                                        const data = await res.json();
                                                        if (data.message === 'updated') {
                                                            setUsers(prev => prev.map(user => user.id === u.id ? { ...user, role: newRole } : user));
                                                            showToast(`User role updated to ${newRole}`);
                                                        }
                                                    } catch (err) {
                                                        alert('Failed to update role');
                                                    }
                                                }}
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', fontSize: '12px' }}
                                            >
                                                <option value="user">User</option>
                                                <option value="seller">Seller</option>
                                                <option value="admin">Admin</option>
                                            </select>

                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                style={{ background: '#fee2e2', color: '#dc2626', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersTable;

