import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OrderTracker from '../components/OrderTracker';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const MyOrders = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (!user) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/orders/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setOrders(data.data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [user]);

    const handleCancel = (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        setCancellingId(orderId);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled' })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'updated') {
                    showToast('Order Cancelled Successfully');
                    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
                }
                setCancellingId(null);
            });
    };

    if (!user) return <div className="container" style={{ textAlign: 'center', padding: '50px' }}>Please login to view orders.</div>;
    if (loading) return <div className="container" style={{ padding: '50px' }}>Loading orders...</div>;
    if (orders.length === 0) return <div className="container" style={{ padding: '50px', textAlign: 'center' }}>No orders found.</div>;

    return (
        <div className="container" style={{ paddingBottom: '50px' }}>
            <h2 style={{ marginBottom: '30px', fontWeight: '800' }}>My Orders</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <AnimatePresence>
                    {orders.map(order => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }} // If we allowed deleting from view
                            className="card"
                            style={{
                                background: 'white',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius-lg)',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Order Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '20px',
                                background: '#f8f9fa',
                                borderBottom: '1px solid var(--border)'
                            }}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order Placed</span>
                                        <span style={{ fontWeight: '600' }}>{new Date(order.date).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Total</span>
                                        <span style={{ fontWeight: '600' }}>${order.total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Ship To</span>
                                        <span style={{ color: 'var(--primary)', cursor: 'pointer' }}>{user.name}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Order # {order.id}</div>
                                    {/* Payment Method Badge */}
                                    {order.payment_method && (
                                        <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: 'bold', color: 'var(--success)' }}>
                                            Starts with {order.payment_method}
                                        </div>
                                    )}
                                    <Link to={`/order/${order.id}`} style={{ display: 'block', marginTop: '5px', fontSize: '12px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold' }}>
                                        View Details &rarr;
                                    </Link>
                                </div>
                            </div>

                            {/* Order Body */}
                            <div style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '5px', color: order.status === 'Cancelled' ? 'var(--error)' : 'var(--text-main)' }}>
                                            Status: {order.status}
                                        </h4>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>
                                            {order.status === 'Delivered' ? 'Package was left near the front door' : 'Updated recently'}
                                        </p>
                                    </div>

                                    {order.status === 'Processing' && (
                                        <button
                                            onClick={() => handleCancel(order.id)}
                                            disabled={cancellingId === order.id}
                                            style={{
                                                padding: '8px 16px',
                                                border: '1px solid var(--error)',
                                                color: 'var(--error)',
                                                background: 'white',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                opacity: cancellingId === order.id ? 0.5 : 1
                                            }}
                                        >
                                            {cancellingId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                        </button>
                                    )}
                                </div>

                                {/* Intelligent Tracker Component */}
                                <OrderTracker
                                    status={order.status || 'Processing'}
                                    trackingId={order.tracking_id}
                                    courier={order.courier_name}
                                    estimatedDelivery={order.estimated_delivery}
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MyOrders;
