import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Cancelled' })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'updated') {
                    setOrder(prev => ({ ...prev, status: 'Cancelled' }));
                    alert('Order Cancelled Successfully');
                }
                setCancelling(false);
            });
    };

    useEffect(() => {
        if (user) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            fetch(`${apiUrl}/api/orders/detail/${id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') setOrder(data.data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id, user]);

    if (!user) return <div className="container">Please login.</div>;
    if (loading) return <div className="container">Loading order details...</div>;
    if (!order) return <div className="container">Order not found.</div>;

    // Check ownership
    // Note: In a real app we would check this on server too, but for UI hiding:
    if (order.user_id !== user.id && user.role !== 'admin' && user.role !== 'seller') {
        return <div className="container">Access Denied</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="container"
            style={{ maxWidth: '800px' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ margin: 0 }}>Order #{order.id}</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    {order.status === 'Processing' && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="btn"
                            style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                opacity: cancelling ? 0.7 : 1
                            }}
                        >
                            {cancelling ? 'Cancelling...' : 'Cancel Order'}
                        </button>
                    )}
                    <Link to="/orders" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Back to Orders</Link>
                </div>
            </div>

            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                <div style={{ padding: '20px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <strong>Placed on:</strong> {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Placed on:</strong> {new Date(order.date).toLocaleDateString()}
                    </div>
                </div>

                {/* Tracking Stepper */}
                <div style={{ padding: '30px 20px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                        {/* Progress Line */}
                        <div style={{ position: 'absolute', top: '15px', left: '0', height: '4px', background: '#e0e0e0', width: '100%', borderRadius: '4px', zIndex: 0 }}></div>

                        {/* Fill Progress */}
                        <div style={{
                            position: 'absolute', top: '15px', left: '0', height: '4px', background: '#10b981', borderRadius: '4px', zIndex: 0,
                            width: (order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'placed') ? '0%' : order.status.toLowerCase() === 'shipped' ? '50%' : '100%'
                        }}></div>

                        {['Placed', 'Shipped', 'Delivered'].map((step, i) => {
                            // "Processing" is equivalent to "Placed" (Step 1)
                            const status = order.status.toLowerCase();
                            const currentStepIndex = (status === 'processing' || status === 'placed') ? 0 : status === 'shipped' ? 1 : 2;
                            const isCompleted = currentStepIndex >= i;

                            return (
                                <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '50%',
                                        background: isCompleted ? '#10b981' : '#f0f0f0',
                                        color: isCompleted ? 'white' : '#888',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '14px', fontWeight: 'bold',
                                        border: isCompleted ? '4px solid #10b981' : '4px solid white', // solid green if active
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                                    }}>
                                        {isCompleted ? '✓' : i + 1}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: '600', marginTop: '8px', color: isCompleted ? '#10b981' : '#94a3b8' }}>
                                        {step === 'Placed' && status === 'processing' ? 'Processing' : step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>Items</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {order.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: '15px' }}>
                                <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '500' }}>{item.title}</div>
                                    <div style={{ color: '#888', fontSize: '14px' }}>x{item.quantity}</div>
                                </div>
                                <div style={{ fontWeight: 'bold' }}>${item.price}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Shipping Address</h3>
                            <p style={{ color: '#666', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{order.shipping_address || 'N/A'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ color: '#888' }}>Total Amount</div>
                            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)' }}>${order.total.toFixed(2)}</div>
                            <div style={{ fontSize: '12px', color: '#666' }}>Payment: {order.payment_method}</div>
                        </div>
                    </div>
                </div>



                {/* VISCERAL LIVE TRACKING MAP */}
                {(order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'out for delivery') && (
                    <div style={{ padding: '20px', background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ width: '10px', height: '10px', background: 'red', borderRadius: '50%', boxShadow: '0 0 10px red', animation: 'pulse 1s infinite' }}></span>
                                Live Delivery Tracking
                            </h3>
                            <span style={{ fontSize: '12px', color: '#666', background: '#f5f5f5', padding: '4px 10px', borderRadius: '12px' }}>Updating live...</span>
                        </div>

                        {/* Map Visualization */}
                        <div style={{ height: '250px', background: '#e5e7eb', borderRadius: '12px', position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                            {/* Road */}
                            <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '8px', background: 'white', transform: 'translateY(-50%)', borderRadius: '4px', border: '2px dashed #9ca3af' }}></div>

                            {/* Driver Icon Animation */}
                            <motion.div
                                animate={{ left: ['10%', '80%', '15%'] }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                style={{ position: 'absolute', top: '50%', left: '10%', transform: 'translate(-50%, -50%)', fontSize: '30px', zIndex: 10 }}
                            >
                                🚚
                            </motion.div>

                            {/* Destination */}
                            <div style={{ position: 'absolute', top: '50%', right: '8%', transform: 'translateY(-50%)', fontSize: '30px' }}>🏠</div>
                        </div>
                        <style>{`@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default OrderDetail;
