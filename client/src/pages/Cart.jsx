import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const Cart = () => {
    const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    const handlePlaceOrder = async () => {
        // This is called AFTER payment success
        try {
            const orderData = {
                user_id: user.id || 1,
                total: cartTotal,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (data.message === 'success') {
                alert(`Order placed successfully! Order ID: ${data.orderId} `);
                clearCart();
                setIsPaymentOpen(false);
                navigate('/orders');
            } else {
                alert('Failed to place order: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Error placing order');
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ background: 'white', padding: '30px', textAlign: 'center' }}>
                <h2>Your cart is empty!</h2>
                <p>Add items to it now.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')} style={{ marginTop: '20px' }}>Shop Now</button>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
            <div style={{ background: 'white', padding: '20px' }}>
                <h2 style={{ marginBottom: '20px' }}>My Cart ({cart.length})</h2>
                {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ width: '100px', height: '100px', flexShrink: 0 }}>
                            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '16px', fontWeight: '500' }}>{item.title}</h3>
                            <div style={{ margin: '10px 0', fontWeight: 'bold' }}>${item.price}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #c2c2c2', background: 'white' }}
                                    >-</button>
                                    <div style={{ border: '1px solid #c2c2c2', padding: '3px 15px' }}>{item.quantity}</div>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #c2c2c2', background: 'white' }}
                                    >+</button>
                                </div>
                                <button onClick={() => removeFromCart(item.id)} style={{ fontWeight: '500', background: 'transparent', fontSize: '14px' }}>REMOVE</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ background: 'white', padding: '20px', position: 'sticky', top: '20px' }}>
                <h3 style={{ color: '#878787', marginBottom: '20px', textTransform: 'uppercase', fontSize: '16px' }}>Price Details</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <div>Price ({cart.length} items)</div>
                    <div>${cartTotal.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: '#388e3c' }}>
                    <div>Discount</div>
                    <div>- $0.00</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', borderTop: '1px dashed #e0e0e0', borderBottom: '1px dashed #e0e0e0', padding: '20px 0', fontSize: '18px', fontWeight: '500' }}>
                    <div>Total Amount</div>
                    <div>${cartTotal.toFixed(2)}</div>
                </div>
                <button
                    onClick={() => {
                        if (!user) navigate('/login');
                        else setIsPaymentOpen(true);
                    }}
                    className="btn btn-secondary"
                    style={{ width: '100%', textTransform: 'uppercase', padding: '15px' }}
                >
                    Place Order
                </button>

                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    onConfirm={handlePlaceOrder}
                    total={cartTotal}
                />
            </div>
        </div>
    );
};

export default Cart;
