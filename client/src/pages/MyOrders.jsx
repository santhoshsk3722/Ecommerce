import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderTracker from '../components/OrderTracker';

const MyOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        fetch(`http://localhost:5000/api/orders/${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.message === 'success') {
                    setOrders(data.data);
                }
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [user]);

    if (!user) return <div style={{ padding: '20px' }}>Please login to view orders.</div>;
    if (loading) return <div style={{ padding: '20px' }}>Loading orders...</div>;
    if (orders.length === 0) return <div style={{ padding: '20px' }}>No orders found.</div>;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>My Orders</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {orders.map(order => (
                    <div key={order.id} style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '4px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                            <div>
                                <span style={{ background: '#2874f0', color: 'white', padding: '3px 8px', borderRadius: '2px', fontSize: '12px', marginRight: '10px' }}>ORDER #{order.id}</span>
                                <span style={{ color: '#878787', fontSize: '14px' }}>{new Date(order.date).toLocaleDateString()}</span>
                            </div>
                            <div style={{ fontWeight: '500' }}>Total: ${order.total.toFixed(2)}</div>
                        </div>

                        <div style={{ padding: '10px 0' }}>
                            <h4 style={{ marginBottom: '15px' }}>Tracking Status</h4>
                            {/* Pass random status if status is not 'Processing' for demo purposes, else use order status */}
                            <OrderTracker status={order.status || 'Processing'} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyOrders;
