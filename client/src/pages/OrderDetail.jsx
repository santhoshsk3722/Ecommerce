/**
 * @file OrderDetail.jsx
 * @description Single Order View.
 * 
 * Shows comprehensive details for a specific order (Items, Shipping, Payment).
 * Includes "Download Invoice" functionality and Order Tracking stepper.
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { motion } from 'framer-motion';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addToCart } = useCart();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const handleCancel = () => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;
        setCancelling(true);
        const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
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

    const handleBuyAgain = (item) => {
        // Construct product object compatible with addToCart
        const product = {
            id: item.product_id, // Assuming item has product_id, if not we might default to item.id if it matches product id
            title: item.title,
            image: item.image,
            price: item.price
        };
        addToCart(product);
        navigate('/cart');
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    useEffect(() => {
        if (user) {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
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
            {/* Print Styles */}
            <style>
                {`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        .invoice-content, .invoice-content * {
                            visibility: visible;
                        }
                        .invoice-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}
            </style>

            <div className="invoice-content" style={{ background: 'white', padding: '20px', borderRadius: '8px' }}>

                {/* Invoice Header (Visible on Print) */}
                <div style={{ borderBottom: '2px solid var(--border)', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0 }}>INVOICE</h1>
                            <p style={{ margin: '5px 0', color: '#64748b' }}>Order #{order.id}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', margin: 0 }}>TechOrbit</h2>
                            <p style={{ margin: '5px 0', fontSize: '14px' }}>Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Normal UI Header (Hidden on Print) */}
                <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0 }}>Order Details</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={handlePrintInvoice}
                            className="btn btn-secondary"
                            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                        >
                            🖨️ Download Invoice
                        </button>
                        {order.status === 'Processing' && (
                            <button
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="btn"
                                style={{
                                    background: 'var(--error)',
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

                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '30px' }}>
                    <div className="no-print" style={{ padding: '20px', background: 'var(--surface-hover)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                            <strong>Placed on:</strong> {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Status:</strong> <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{order.status}</span>
                        </div>
                    </div>

                    {/* Tracking Stepper (Hidden on Print) */}
                    <div className="no-print" style={{ padding: '35px 20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                            {/* Background Line */}
                            <div style={{ position: 'absolute', top: '15px', left: '0', height: '4px', background: 'var(--border)', width: '100%', borderRadius: '4px', zIndex: 0 }}></div>

                            {/* Active Progress Line */}
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                    width: (order.status.toLowerCase() === 'processing' || order.status.toLowerCase() === 'placed') ? '0%' : order.status.toLowerCase() === 'shipped' ? '50%' : '100%'
                                }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute', top: '15px', left: '0', height: '4px', background: '#10b981', borderRadius: '4px', zIndex: 0
                                }}
                            />

                            {['Placed', 'Shipped', 'Delivered'].map((step, i) => {
                                const status = order.status.toLowerCase();
                                // Logic: 0=Placed, 1=Shipped, 2=Delivered
                                const currentStepIndex = (status === 'processing' || status === 'placed') ? 0 : status === 'shipped' ? 1 : 2;
                                const isCompleted = currentStepIndex >= i;
                                const isCurrent = currentStepIndex === i;

                                return (
                                    <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, position: 'relative' }}>
                                        <motion.div
                                            initial={{ scale: 0.8 }}
                                            animate={{ scale: isCompleted ? 1 : 0.8 }}
                                            style={{
                                                width: '32px', height: '32px', borderRadius: '50%',
                                                background: isCompleted ? '#10b981' : 'var(--surface)',
                                                color: isCompleted ? 'white' : 'var(--text-secondary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '14px', fontWeight: 'bold',
                                                border: isCompleted ? '4px solid #10b981' : '2px solid var(--border)',
                                                boxShadow: isCurrent ? '0 0 0 4px rgba(16, 185, 129, 0.2)' : 'none'
                                            }}
                                        >
                                            {isCompleted ? '✓' : i + 1}
                                        </motion.div>
                                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: isCompleted ? 'var(--text-main)' : 'var(--text-secondary)' }}>
                                                {step === 'Placed' && status === 'processing' ? 'Processing' : step}
                                            </div>
                                            {isCompleted && (
                                                <div style={{ fontSize: '11px', color: 'var(--success)' }}>
                                                    {i === 0 ? new Date(order.date).toLocaleDateString() : (i === 1 && status === 'shipped') ? 'Today' : ''}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Items Ordered</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {order.items.map(item => (
                                <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '15px' }}>
                                    <img src={item.image} alt={item.title} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '500' }}>{item.title}</div>
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>x{item.quantity}</div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontWeight: 'bold' }}>${item.price}</div>
                                        <button
                                            className="no-print"
                                            onClick={() => handleBuyAgain(item)}
                                            style={{
                                                fontSize: '12px',
                                                color: 'var(--primary)',
                                                background: 'transparent',
                                                border: '1px solid var(--primary)',
                                                borderRadius: '4px',
                                                padding: '4px 8px',
                                                marginTop: '5px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Buy Again
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '5px' }}>Shipping Address</h3>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{order.shipping_address || 'N/A'}</p>
                            </div>
                            <div style={{ textAlign: 'right', minWidth: '200px' }}>
                                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
                                        <span>${order.total.toFixed(2)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Shipping:</span>
                                        <span>Free</span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Total:</span>
                                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>${order.total.toFixed(2)}</span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Payment: {order.payment_method}</div>
                            </div>
                        </div>
                    </div>

                    {/* VISCERAL LIVE TRACKING MAP (Hidden on Print) */}
                    {(order.status.toLowerCase() === 'shipped' || order.status.toLowerCase() === 'out for delivery') && (
                        <div className="no-print" style={{ padding: '20px', background: 'var(--surface)', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '10px', height: '10px', background: 'red', borderRadius: '50%', boxShadow: '0 0 10px red', animation: 'pulse 1s infinite' }}></span>
                                    Live Delivery Tracking
                                </h3>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--surface-hover)', padding: '4px 10px', borderRadius: '12px' }}>Updating live...</span>
                            </div>

                            {/* Map Visualization */}
                            <div style={{ height: '250px', background: 'var(--surface-hover)', borderRadius: '12px', position: 'relative', overflow: 'hidden', backgroundImage: 'radial-gradient(circle, var(--text-light) 1px, transparent 1px)', backgroundSize: '20px 20px', opacity: 0.8 }}>
                                {/* Road */}
                                <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: '8px', background: 'var(--text-secondary)', transform: 'translateY(-50%)', borderRadius: '4px', border: '2px dashed var(--border)' }}></div>

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
            </div>
        </motion.div>
    );
};

export default OrderDetail;

