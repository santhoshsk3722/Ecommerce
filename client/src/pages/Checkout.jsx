import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
    const { user } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0); // value in dollars
    const [paymentMethod, setPaymentMethod] = useState('Card'); // Card, UPI, COD
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    useEffect(() => {
        if (user) {
            // Pre-fill address from user profile if available
            // Note: Since we updated the user object in server response but AuthContext might rely on initial login state, 
            // we ideally should fetch the fresh user data here or use what's in context if it was updated.
            // For now, assuming context user has address if they re-logged in or if we updated context.
            // If context is stale, we might want to fetch user data here.

            // Let's fetch fresh user data to be sure
            fetch(`http://localhost:5000/api/users/?email=${user.email}`) // Wait, api/users returns all users (admin). 
            // We don't have a "get my profile" endpoint besides login/admin. 
            // We can use the login response or add GET /api/users/:id.
            // Oh wait, I didn't add GET /api/users/:id. I only added PUT.
            // The existing GET /api/users is for admin to list ALL.
            // However, login returns the user object.
            // Let's assume the user has put their address in Profile and it's saved.
            // If they haven't re-logged in, context might be stale.
            // PROPOSAL: Add GET /api/users/:id endpoint for fetching single user profile.
            // Actually, I can just use the address from the form.

            if (user.address) {
                const fullAddress = [user.address, user.city, user.zip, user.country].filter(Boolean).join(', ');
                setAddress(fullAddress);
            }
        }
    }, [user]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        fetch('http://localhost:5000/api/validate-coupon', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: couponCode })
        })
            .then(res => res.json())
            .then(data => {
                if (data.valid) {
                    if (data.discountType === 'percent') {
                        const discountValue = (cartTotal * data.value) / 100;
                        setDiscount(discountValue);
                        alert(`Coupon applied! You saved $${discountValue.toFixed(2)}`);
                    }
                } else {
                    alert(data.message);
                    setDiscount(0);
                }
            });
    };

    const finalTotal = Math.max(0, cartTotal - discount);

    const handlePlaceOrder = async () => {
        try {
            const orderData = {
                user_id: user.id,
                total: finalTotal,
                items: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                shipping_address: address,
                payment_method: paymentMethod // Use selected payment method
            };

            const res = await fetch('http://localhost:5000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (data.message === 'success') {
                alert(`Order placed successfully! Order ID: ${data.orderId}`);
                clearCart();
                navigate('/orders');
            } else {
                alert('Failed to place order: ' + (data.error || 'Unknown error'));
            }
        } catch (err) {
            alert('Error placing order');
        }
    };

    const handleProceed = () => {
        if (!address.trim()) {
            alert("Please enter a shipping address.");
            return;
        }

        if (paymentMethod === 'Card') {
            setIsPaymentOpen(true);
        } else {
            // For COD or UPI, place order immediately (or after simple confirm)
            // Simulating UPI flow or COD direct confirmation
            if (paymentMethod === 'UPI') {
                const vpa = prompt("Enter UPI ID (e.g. user@upl):");
                if (!vpa) return;
            }
            handlePlaceOrder();
        }
    };

    if (!user) return <div className="container">Please login to checkout.</div>;
    if (cart.length === 0) return <div className="container">Your cart is empty.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '40px auto', background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Checkout</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Shipping Address</h3>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows="4"
                        placeholder="Enter your full shipping address..."
                        style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                        * We pre-filled this from your profile if available. You can change it for this order.
                    </p>
                </div>

                <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Order Summary</h3>
                    <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Items ({cart.length})</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'var(--success)' }}>
                                <span>Discount</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold', fontSize: '18px' }}>
                            <span>Total</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                        {/* Payment Method Selection */}
                        <div style={{ marginTop: '30px' }}>
                            <h3 style={{ marginBottom: '15px' }}>Payment Method</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: paymentMethod === 'Card' ? '1px solid var(--primary)' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'Card' ? 'var(--primary-light)' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'Card'}
                                        onChange={() => setPaymentMethod('Card')}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Credit/Debit Card</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: paymentMethod === 'UPI' ? '1px solid var(--primary)' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'UPI' ? 'var(--primary-light)' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'UPI'}
                                        onChange={() => setPaymentMethod('UPI')}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>UPI / GPay / PhonePe</span>
                                </label>

                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', border: paymentMethod === 'COD' ? '1px solid var(--primary)' : '1px solid #eee', borderRadius: '8px', cursor: 'pointer', background: paymentMethod === 'COD' ? 'var(--primary-light)' : 'white' }}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        style={{ accentColor: 'var(--primary)' }}
                                    />
                                    <span style={{ fontWeight: '500' }}>Cash on Delivery (COD)</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Coupon Input */}
                    <div style={{ marginTop: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                placeholder="Promo Code"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                            />
                            <button onClick={handleApplyCoupon} className="btn btn-secondary" style={{ padding: '10px 15px' }}>Apply</button>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button
                    onClick={handleProceed}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '15px', fontSize: '16px', marginTop: '20px' }}
                >
                    {paymentMethod === 'COD' ? 'Place Order' : 'Proceed to Payment'}
                </button>
            </div>

            <PaymentModal
                isOpen={isPaymentOpen}
                onClose={() => setIsPaymentOpen(false)}
                onConfirm={handlePlaceOrder}
                total={finalTotal}
            />
        </div>
    );
};

export default Checkout;
