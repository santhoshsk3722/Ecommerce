import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

const SellerOrders = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'seller') {
            fetch(`http://localhost:5000/api/orders/seller/${user.id}`)
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
        fetch(`http://localhost:5000/api/orders/${orderId}`, {
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

    const handleAddTracking = (orderId) => {
        const trackingId = prompt("Enter Tracking ID:");
        const courierName = prompt("Enter Courier Name:");
        if (trackingId && courierName) {
            fetch(`http://localhost:5000/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tracking_id: trackingId, courier_name: courierName, status: 'Shipped' })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message === 'updated') {
                        showToast('Tracking info added & marked Shipped', 'success');
                        setOrders(orders.map(o => o.id === orderId ? { ...o, tracking_id: trackingId, courier_name: courierName, status: 'Shipped' } : o));
                    }
                });
        }
    };

    if (loading) return <div className="container">Loading...</div>;
    if (!user || user.role !== 'seller') return <div className="container">Access Denied</div>;

    return (
        <div className="container">
            <h2 style={{ marginBottom: '30px' }}>Manage Orders</h2>

            {orders.length === 0 ? (
                <div style={{ color: '#888' }}>No orders found needing your products.</div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {orders.map(order => (
                        <div key={order.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                                <div>
                                    <strong>Order #{order.id}</strong>
                                    <span style={{ marginLeft: '10px', color: '#888', fontSize: '14px' }}>{new Date(order.date).toLocaleDateString()}</span>
                                </div>
                                <div>
                                    <span style={{
                                        padding: '5px 10px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        background: order.status === 'Delivered' ? '#e6fffa' : order.status === 'Shipped' ? '#ebf8ff' : '#fff5f5',
                                        color: order.status === 'Delivered' ? '#2c7a7b' : order.status === 'Shipped' ? '#2b6cb0' : '#c53030'
                                    }}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div style={{ marginBottom: '15px' }}>
                                <h4 style={{ fontSize: '14px', marginBottom: '10px', color: '#555' }}>Items to Ship:</h4>
                                {order.items.map(item => (
                                    <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                                        <img src={item.image} alt={item.title} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.title}</div>
                                            <div style={{ fontSize: '13px', color: '#888' }}>Qty: {item.quantity} | Price: ${item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                {order.status === 'Processing' && (
                                    <button
                                        onClick={() => handleAddTracking(order.id)}
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
                                        style={{ fontSize: '13px', padding: '8px 15px', background: '#38a169', color: 'white', border: 'none', borderRadius: '4px' }}
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                                <div style={{ fontSize: '13px', color: '#888', alignSelf: 'center' }}>
                                    {order.tracking_id && `Tracking: ${order.courier_name} - ${order.tracking_id}`}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SellerOrders;
