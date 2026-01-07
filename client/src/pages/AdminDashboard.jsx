import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { SalesByCategoryChart, TopProductsTable } from '../components/AdminCharts';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, revenue: 0 });
    const [analytics, setAnalytics] = useState({ salesByCategory: [], topProducts: [] });
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'admin') {
            setLoading(true);
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            Promise.all([
                fetch(`${apiUrl}/api/stats`).then(res => res.json()),
                fetch(`${apiUrl}/api/users`).then(res => res.json()),
                fetch(`${apiUrl}/api/admin/analytics`).then(res => res.json())
            ]).then(([statsData, usersData, analyticsData]) => {
                if (statsData.message === 'success') setStats(statsData.data);
                if (usersData.message === 'success') setUsersList(usersData.data);
                if (analyticsData.message === 'success') setAnalytics(analyticsData.data);
                setLoading(false);
            });
        }
    }, [user]);

    if (!user || user.role !== 'admin') return <div className="container" style={{ padding: '20px' }}>Access Denied</div>;

    // Mock Trend (Keep existing mock for visual consistency until daily endpoint exists)
    const revenueTrend = [4000, 3000, 5000, 7000, 6000, 8000, stats.revenue || 9500];
    const maxRev = Math.max(...revenueTrend);
    const chartPoints = revenueTrend.map((val, i) => `${i * 100},${150 - (val / maxRev * 100)}`).join(' ');

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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '30px' }}>

                {/* Sales By Category Chart */}
                <div className="card" style={{ padding: '20px', height: '350px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', color: 'var(--text-secondary)' }}>Sales by Category</h3>
                    <SalesByCategoryChart data={analytics.salesByCategory} />
                </div>

                {/* Revenue Trend (Visual Only) */}
                <div className="card" style={{ padding: '20px', height: '350px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '20px', color: '#64748b' }}>Revenue Trend (Weekly)</h3>
                    <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                        <svg viewBox="0 0 600 150" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                            <line x1="0" y1="0" x2="600" y2="0" stroke="var(--border)" />
                            <line x1="0" y1="150" x2="600" y2="150" stroke="var(--border)" />
                            <motion.polyline
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5 }}
                                points={chartPoints}
                                fill="none"
                                stroke="var(--primary)"
                                strokeWidth="3"
                            />
                            <polygon points={`0,150 ${chartPoints} 600,150`} fill="var(--primary)" fillOpacity="0.1" />
                            {revenueTrend.map((val, i) => (
                                <circle key={i} cx={i * 100} cy={150 - (val / maxRev * 100)} r="4" fill="var(--surface)" stroke="var(--primary)" strokeWidth="2" />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>

            {/* Data Tables Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>

                {/* Top Products Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Top Selling Products</h3>
                    </div>
                    <TopProductsTable data={analytics.topProducts} />
                </div>

                {/* Users Table */}
                <div className="card" style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>Recent Users</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                        <thead style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersList.slice(0, 5).map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.email}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '12px', background: u.role === 'admin' ? 'var(--surface-active)' : 'var(--surface-hover)', color: u.role === 'admin' ? 'var(--accent)' : 'var(--text-secondary)' }}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
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
                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#dc2626' }}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
