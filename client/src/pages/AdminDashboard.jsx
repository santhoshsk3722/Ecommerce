import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'admin') {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            Promise.all([
                fetch(`${apiUrl}/api/stats`).then(res => res.json()),
                fetch(`${apiUrl}/api/users`).then(res => res.json())
            ]).then(([statsData, usersData]) => {
                if (statsData.message === 'success') setStats(statsData.data);
                if (usersData.message === 'success') setUsersList(usersData.data);
                setLoading(false);
            });
        }
    }, [user]);

    if (!user || user.role !== 'admin') return <div className="container" style={{ padding: '20px' }}>Access Denied</div>;

    // Mock Data for Charts (Simulating Trends)
    const revenueTrend = [4000, 3000, 5000, 7000, 6000, 8000, stats.revenue || 9500];
    const maxRev = Math.max(...revenueTrend);
    const chartPoints = revenueTrend.map((val, i) => `${i * 100},${150 - (val / maxRev * 100)}`).join(' ');

    const orderStatusData = [
        { label: 'Delivered', value: 65, color: '#10b981' },
        { label: 'Shipped', value: 25, color: '#3b82f6' },
        { label: 'Pending', value: 10, color: '#f59e0b' }
    ];

    // SVG Pie Chart Calculation
    let cumulativePercent = 0;
    const getCoordinatesForPercent = (percent) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div style={{ padding: '20px', background: 'var(--background)', minHeight: '100vh' }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: '800', color: 'var(--text-main)' }}>Analytics Dashboard</h2>

            {/* Top Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <StatsCard title="Total Revenue" value={`$${stats.revenue?.toLocaleString()}`} change="+12.5%" color="#2563eb" icon="💰" />
                <StatsCard title="Total Orders" value={stats.orders} change="+8.2%" color="#10b981" icon="📦" />
                <StatsCard title="Active Users" value={stats.users} change="+5.1%" color="#f59e0b" icon="👥" />
                <StatsCard title="Products" value={stats.products} change="+2.3%" color="#8b5cf6" icon="🛍️" />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>

                {/* Revenue Trend Chart */}
                <div className="card" style={{ padding: '20px', height: '300px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#64748b' }}>Revenue Trend (Last 7 Days)</h3>
                    <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                        <svg viewBox="0 0 600 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            {/* Grid Lines */}
                            <line x1="0" y1="0" x2="600" y2="0" stroke="#eee" />
                            <line x1="0" y1="50" x2="600" y2="50" stroke="#eee" />
                            <line x1="0" y1="100" x2="600" y2="100" stroke="#eee" />
                            <line x1="0" y1="150" x2="600" y2="150" stroke="#eee" />

                            {/* Polyline */}
                            <motion.polyline
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5 }}
                                points={chartPoints}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="3"
                            />
                            {/* Area under curve (Optional simple fill) */}
                            <polygon points={`0,150 ${chartPoints} 600,150`} fill="var(--primary)" fillOpacity="0.1" />

                            {/* Points */}
                            {revenueTrend.map((val, i) => (
                                <circle key={i} cx={i * 100} cy={150 - (val / maxRev * 100)} r="4" fill="white" stroke="var(--primary)" strokeWidth="2" />
                            ))}
                        </svg>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', color: '#94a3b8', fontSize: '12px' }}>
                        <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                    </div>
                </div>

                {/* Order Status Pie Chart */}
                <div className="card" style={{ padding: '20px', height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>Order Status</h3>
                    <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                        <svg viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
                            {orderStatusData.map((slice, i) => {
                                const start = getCoordinatesForPercent(cumulativePercent);
                                cumulativePercent += slice.value / 100;
                                const end = getCoordinatesForPercent(cumulativePercent);
                                const largeArcFlag = slice.value / 100 > 0.5 ? 1 : 0;
                                const pathData = [
                                    `M ${start[0]} ${start[1]}`,
                                    `A 1 1 0 ${largeArcFlag} 1 ${end[0]} ${end[1]}`,
                                    `L 0 0`,
                                ].join(' ');
                                return (
                                    <path key={i} d={pathData} fill={slice.color} stroke="var(--surface)" strokeWidth="0.05" />
                                );
                            })}
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'var(--surface)', borderRadius: '50%', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.orders}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Total</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', marginTop: '20px', fontSize: '12px' }}>
                        {orderStatusData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ width: '8px', height: '8px', background: d.color, borderRadius: '50%' }}></span>
                                {d.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Recent Users</h3>
                    <button className="btn btn-secondary" style={{ fontSize: '12px', padding: '8px 12px' }}>Export Data</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                    <thead style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left' }}>User / Email</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {usersList.slice(0, 5).map(u => (
                            <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ fontWeight: '600' }}>{u.name}</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '20px',
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        background: u.role === 'admin' ? 'var(--surface-active)' : 'var(--surface-hover)', // Simplified for consistency
                                        color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)'
                                    }}>
                                        {u.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '12px' }}>● Active</span>
                                </td>
                                <td style={{ padding: '15px' }}>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => {
                                                if (window.confirm(`Delete user ${u.name}?`)) {
                                                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                                                    fetch(`${apiUrl}/api/users/${u.id}`, { method: 'DELETE' })
                                                        .then(res => res.json())
                                                        .then(data => {
                                                            if (data.message === 'deleted') {
                                                                setUsersList(prev => prev.filter(user => user.id !== u.id));
                                                            }
                                                        });
                                                }
                                            }}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626', fontSize: '18px' }}
                                            title="Delete User"
                                        >
                                            🗑️
                                        </button>
                                        <button
                                            onClick={() => alert('Edit feature coming soon!')}
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#3b82f6', fontSize: '18px' }}
                                            title="Edit User"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    );
};

const StatsCard = ({ title, value, change, color, icon }) => (
    <div className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: `${color}20`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
            {icon}
        </div>
        <div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{title}</div>
            <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-main)' }}>{value}</div>
            <div style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>{change} from last month</div>
        </div>
    </div>
);

export default AdminDashboard;
