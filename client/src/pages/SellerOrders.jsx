/**
 * @file SellerOrders.jsx
 * @description Seller Order Management.
 * 
 * Lists orders containing products sold by the current user.
 * Allows sellers to update order status (e.g., Shipped) and add tracking info.
 */

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';
import { sendOrderShippedEmail } from '../utils/emailService';

const SellerOrders = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'seller') {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
            fetch(`${apiUrl}/api/orders/seller/${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'success') {
                        setOrders(data.data);
                    }
                    setLoading(false);
                });
        }
    }, [user]);

    const handleUpdateStatus = (orderId, newStatus) => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'updated') {
                    showToast(`Order status updated to ${newStatus}`, 'success');
                    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
                }
            });
    };

    const [trackingModal, setTrackingModal] = useState({ show: false, orderId: null, trackingId: '', courier: '' });

    const openShipModal = (orderId) => {
        setTrackingModal({ show: true, orderId: orderId, trackingId: '', courier: '' });
    };

    const closeShipModal = () => {
        setTrackingModal({ show: false, orderId: null, trackingId: '', courier: '' });
    };

    const handleShipOrder = () => {
        const { orderId, trackingId, courier } = trackingModal;
        if (!trackingId || !courier) {
            showToast('Please enter both Tracking ID and Courier Name', 'error');
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
        fetch(`${apiUrl}/api/orders/${orderId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracking_id: trackingId, courier_name: courier, status: 'Shipped' })
        })
            .then(res => res.json())
            .then(data => {
                if (data.message === 'updated') {
                    showToast('Tracking info added & marked Shipped', 'success');

                    // Find the order to get customer details
                    const order = orders.find(o => o.id === orderId);
                    if (order && order.customer_email) {
                        sendOrderShippedEmail(orderId, order.customer_name, order.customer_email, trackingId, courier);
                    }

                    setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_id: trackingId, courier_name: courier, status: 'Shipped' } : o));
                    closeShipModal();
                }
            });
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!user || user.role !== 'seller') return <div className="container">Access Denied</div>;

    return (
        <div className="container" style={{ paddingBottom: '50px', position: 'relative' }}>
            <h2 style={{ marginBottom: '30px', color: 'var(--text-main)' }}>Manage Orders</h2>

            {orders.length === 0 ? (
                <div style={{ color: 'var(--text-secondary)' }}>No orders found needing your products.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                                <div>
                                    <strong style={{ color: 'var(--text-main)' }}>Order #{order.id}</strong>
                                    <span style={{ marginLeft: '10px', color: 'var(--text-secondary)', fontSize: '14px' }}>{new Date(order.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        background: order.status === 'Delivered' ? 'rgba(56, 161, 105, 0.1)' : order.status === 'Shipped' ? 'rgba(49, 130, 206, 0.1)' : 'rgba(229, 62, 62, 0.1)',
                                        color: order.status === 'Delivered' ? 'var(--success)' : order.status === 'Shipped' ? '#3182ce' : 'var(--error)'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: 'var(--text-secondary)' }}>Items to Ship:</h4>
                                {order.items.map(item => (
                                    <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                        <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'var(--surface)', borderRadius: '4px', border: '1px solid var(--border)' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{item.title}</div>
                                            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Qty: {item.quantity} | Price: ${item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: '15px', padding: '15px', background: 'var(--surface-hover)', borderRadius: '8px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-main)' }}>Shipping Details</h4>
                                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                    <div><strong>To:</strong> {order.customer_name} ({order.customer_email})</div>
                                    <div style={{ marginTop: '5px' }}><strong>Address:</strong> {order.shipping_address || 'No address provided'}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--border)', paddingTop: '15px' }}>
                                {order.status === 'Processing' && (
                                    <button
                                        onClick={() => openShipModal(order.id)}
                                        className="btn btn-primary"
                                        style={{ fontSize: '13px', padding: '8px 15px' }}
                                    >
                                        Ship Order
                                    </button>
                                )}
                                {order.status === 'Shipped' && (
                                    <button
                                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                                        className="btn btn-success"
                                        style={{ fontSize: '13px', padding: '8px 15px', background: 'var(--success)', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', alignSelf: 'center' }}>
                                    {order.tracking_id && `Tracking: ${order.courier_name} - ${order.tracking_id}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Shipping Modal */}
            {trackingModal.show && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: 'var(--surface)', padding: '30px', borderRadius: '12px',
                            width: '400px', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)'
                        }}
                    >
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>Ship Order #{trackingModal.orderId}</h3>

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Courier Name</label>
                            <input
                                autoFocus
                                placeholder="e.g. FedEx, DHL, BlueDart"
                                value={trackingModal.courier}
                                onChange={e => setTrackingModal({ ...trackingModal, courier: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                            />
                        </div>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tracking ID</label>
                            <input
                                placeholder="e.g. TRK123456789"
                                value={trackingModal.trackingId}
                                onChange={e => setTrackingModal({ ...trackingModal, trackingId: e.target.value })}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)' }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleShipOrder} className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>Confirm Shipment</button>
                            <button onClick={closeShipModal} className="btn btn-secondary" style={{ flex: 1, padding: '10px' }}>Cancel</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default SellerOrders;

