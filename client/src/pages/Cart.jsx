import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
// import PaymentModal from '../components/PaymentModal';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    // const [isPaymentOpen, setIsPaymentOpen] = useState(false); // Moved to Checkout

    // Order logic moved to Checkout.jsx

    if (cart.length === 0) {
        return (
            <div style={{ background: 'var(--surface)', padding: '50px', textAlign: 'center', borderRadius: '16px', border: '1px solid var(--border)' }}>
                <h2 style={{ color: 'var(--text-main)', marginBottom: '10px' }}>Your cart is empty!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Looks like you haven't added anything yet.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px', padding: '12px 30px', borderRadius: '12px' }}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="responsive-grid-2col">
            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ marginBottom: '20px', color: 'var(--text-main)' }}>My Cart ({cart.length})</h2>
                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', flexDirection: 'row', gap: '20px', padding: '20px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
                        <div style={{ width: '100px', height: '100px', flexShrink: 0, background: 'white', padding: '5px', borderRadius: '8px' }}>
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '500', color: 'var(--text-main)' }}>{item.title}</h3>
                            <div style={{ margin: '10px 0', fontWeight: 'bold', color: 'var(--primary)' }}>${item.price}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)', cursor: 'pointer' }}
                                    >-</button>
                                    <div style={{ border: '1px solid var(--border)', padding: '5px 15px', borderRadius: '8px', color: 'var(--text-main)' }}>{item.quantity}</div>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface-hover)', color: 'var(--text-main)', cursor: 'pointer' }}
                                    >+</button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    style={{
                                        fontWeight: '600',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        color: '#ef4444',
                                        border: 'none',
                                        padding: '8px 16px',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={e => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                                    onMouseLeave={e => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                                >
                                    🗑 Remove
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'var(--surface)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-sm)', position: 'sticky', top: '20px', height: 'fit-content' }}>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '20px', textTransform: 'uppercase', fontSize: '16px' }}>Price Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-main)' }}>
                    <div>Price ({cart.length} items)</div>
                    <div>${cartTotal.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--success)' }}>
                    <div>Discount</div>
                    <div>- $0.00</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '20px 0', fontSize: '18px', fontWeight: '500', color: 'var(--text-main)' }}>
                    <div>Total Amount</div>
                    <div>${cartTotal.toFixed(2)}</div>
                </div>
                <button
                    onClick={() => {
                        if (!user) navigate('/login');
                        else navigate('/checkout');
                    }}
                    className="btn btn-primary"
                    style={{ width: '100%', textTransform: 'uppercase', padding: '15px', borderRadius: '12px', fontWeight: 'bold' }}
                >
                    Checkout
                </button>
                <div style={{ marginTop: '15px' }}>
                    <button
                        onClick={() => {
                            // Dummy Copy Link
                            const link = `https://techorbit.shop/share/cart/${Math.random().toString(36).substr(2, 9)}`;
                            navigator.clipboard.writeText(link);
                            alert("Cart Link Copied! Share it with friends to split the bill.");
                        }}
                        style={{ background: 'none', border: '1px dashed var(--primary)', color: 'var(--primary)', width: '100%', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                    >
                        🔗 Share Cart / Split Bill
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
