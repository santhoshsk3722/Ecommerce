import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const OrderDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:5000/api/orders/detail/${id}`)
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
                <Link to="/orders" className="btn btn-secondary" style={{ textDecoration: 'none', padding: '10px 20px' }}>Back to Orders</Link>
            </div>

            <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                <div style={{ padding: '20px', background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <strong>Placed on:</strong> {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div>
                        <strong>Status:</strong> <span style={{ color: order.status === 'Delivered' ? 'green' : 'orange' }}>{order.status}</span>
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

                {/* Logistics Info */}
                {(order.tracking_id || order.courier_name) && (
                    <div style={{ background: '#e3f2fd', padding: '15px', borderTop: '1px solid #bbdefb' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Tracking Information</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                            {order.courier_name && <div><strong>Courier:</strong> {order.courier_name}</div>}
                            {order.tracking_id && <div><strong>Tracking ID:</strong> {order.tracking_id}</div>}
                            {order.estimated_delivery && <div><strong>Est. Delivery:</strong> {order.estimated_delivery}</div>}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default OrderDetail;
