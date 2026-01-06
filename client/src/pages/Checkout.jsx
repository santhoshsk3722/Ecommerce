import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLoyalty } from '../context/LoyaltyContext';
import { useNavigate, Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';

const Checkout = () => {
    const { user } = useAuth();
    const { cart, cartTotal, clearCart } = useCart();
    const { points, spendPoints } = useLoyalty();
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [redeemedPoints, setRedeemedPoints] = useState(0); // Points user wants to spend
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);

    // UI Validation & Success States
    const [errors, setErrors] = useState({});
    const [orderSuccess, setOrderSuccess] = useState(null); // stores order ID if success

    useEffect(() => {
        if (user) {
            if (user.address) {
                const fullAddress = [user.address, user.city, user.zip, user.country].filter(Boolean).join(', ');
                setAddress(fullAddress);
            }
        }
    }, [user]);

    const handleApplyCoupon = () => {
        if (!couponCode.trim()) return;
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        fetch(`${apiUrl}/api/validate-coupon`, {
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
                        setErrors(prev => ({ ...prev, coupon: null })); // clear coupon error
                    }
                } else {
                    setErrors(prev => ({ ...prev, coupon: data.message }));
                    setDiscount(0);
                }
            });
    };

    const handleAutoApplyCoupon = async () => {
        // Mocking fetching available coupons or using fixed list
        const availableCoupons = ['SAVE10', 'WELCOME20', 'TECHORBIT50']; // In real app, fetch from API user's available coupons

        let bestDiscount = 0;
        let bestCode = '';

        setErrors(prev => ({ ...prev, coupon: "Finding best deal..." }));

        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        // Quick simulation of checking multiple
        for (const code of availableCoupons) {
            const res = await fetch(`${apiUrl}/api/validate-coupon`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (data.valid && data.discountType === 'percent') {
                const val = (cartTotal * data.value) / 100;
                if (val > bestDiscount) {
                    bestDiscount = val;
                    bestCode = code;
                }
            }
        }

        if (bestDiscount > 0) {
            setDiscount(bestDiscount);
            setCouponCode(bestCode);
            setErrors(prev => ({ ...prev, coupon: null }));
        } else {
            setErrors(prev => ({ ...prev, coupon: "No better coupons found." }));
        }
    };

    const pointDiscount = redeemedPoints / 10; // 10 points = $1
    const finalTotal = Math.max(0, cartTotal - discount - pointDiscount);

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
                payment_method: paymentMethod
            };

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            const data = await res.json();
            if (data.message === 'success') {
                // Show inline success instead of alert
                if (redeemedPoints > 0) spendPoints(redeemedPoints);
                setOrderSuccess(data.orderId);
                clearCart();
            } else {
                setErrors(prev => ({ ...prev, general: 'Failed to place order: ' + (data.error || 'Unknown error') }));
            }
        } catch (err) {
            setErrors(prev => ({ ...prev, general: 'Network error. Please try again.' }));
        }
    };

    const handleProceed = () => {
        const newErrors = {};
        if (!address.trim()) newErrors.address = "Shipping address is required.";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        if (paymentMethod === 'Card') {
            setIsPaymentOpen(true);
        } else {
            if (paymentMethod === 'UPI') {
                const vpa = prompt("Enter UPI ID (e.g. user@upl):"); // Keeping prompt for UPI specifically as requested flow separate, or could simulate
                if (!vpa) return;
            }
            handlePlaceOrder();
        }
    };

    if (!user) return <div className="container">Please login to checkout.</div>;

    // Scroll to top when order is successful
    useEffect(() => {
        if (orderSuccess) {
            window.scrollTo(0, 0);
        }
    }, [orderSuccess]);

    // Order Success View
    if (orderSuccess) {
        return (
            <div style={{ maxWidth: '600px', margin: '40px auto', background: 'var(--surface)', padding: '50px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', background: 'var(--success)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', margin: '0 auto 20px' }}>✓</div>
                <h2 style={{ fontSize: '28px', color: 'var(--text-main)', marginBottom: '10px' }}>Order Placed Successfully!</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Your order #{orderSuccess} has been confirmed. We will ship it shortly.</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to={`/order/${orderSuccess}`} className="btn btn-primary" style={{ padding: '12px 25px' }}>Track Order</Link>
                    <Link to="/" className="btn btn-secondary" style={{ padding: '12px 25px' }}>Continue Shopping</Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) return <div className="container">Your cart is empty.</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '40px auto', background: 'var(--surface)', padding: '10px 30px 40px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <h2 style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px', fontSize: '24px' }}>Checkout</h2>

            {errors.general && (
                <div style={{ padding: '15px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '20px' }}>
                    {errors.general}
                </div>
            )}

            <div className="responsive-grid-checkout">
                {/* Left Column: Address */}
                <div>
                    <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>1. Shipping Address</h3>
                    <div className="card" style={{ padding: '20px', border: errors.address ? '1px solid #dc2626' : 'none', boxShadow: 'none', background: 'var(--surface-hover)' }}>
                        <textarea
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors(prev => ({ ...prev, address: null })); }}
                            rows="4"
                            placeholder="Enter your full shipping address..."
                            style={{
                                width: '100%',
                                padding: '15px',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                resize: 'vertical',
                                fontSize: '14px',
                                background: 'var(--surface)',
                                color: 'var(--text-main)'
                            }}
                        />
                        {errors.address && <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '5px' }}>{errors.address}</div>}
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '10px' }}>
                            * We pre-filled this from your profile if available. You can change it for this order.
                        </p>
                    </div>

                    {/* Payment Method Selection */}
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px', color: 'var(--text-main)' }}>2. Payment Method</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', border: paymentMethod === 'Card' ? '2px solid var(--primary)' : '1px solid var(--border)', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'Card' ? 'var(--surface-hover)' : 'var(--surface)', transition: 'all 0.2s' }}>
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'Card'}
                                    onChange={() => setPaymentMethod('Card')}
                                    style={{ accentColor: 'var(--primary)', width: '20px', height: '20px' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Credit/Debit Card</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visa, Mastercard, Amex</div>
                                </div>
                                <span style={{ marginLeft: 'auto', fontSize: '20px' }}>💳</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', border: paymentMethod === 'UPI' ? '2px solid var(--primary)' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'UPI' ? 'var(--surface-hover)' : 'var(--surface)', transition: 'all 0.2s' }}>
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={() => setPaymentMethod('UPI')}
                                    style={{ accentColor: 'var(--primary)', width: '20px', height: '20px' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>UPI / GPay / PhonePe</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Instant payment</div>
                                </div>
                                <span style={{ marginLeft: 'auto', fontSize: '20px' }}>📱</span>
                            </label>

                            <label style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '18px', border: paymentMethod === 'COD' ? '2px solid var(--primary)' : '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', background: paymentMethod === 'COD' ? 'var(--surface-hover)' : 'var(--surface)', transition: 'all 0.2s' }}>
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'COD'}
                                    onChange={() => setPaymentMethod('COD')}
                                    style={{ accentColor: 'var(--primary)', width: '20px', height: '20px' }}
                                />
                                <div>
                                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Cash on Delivery</div>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Pay when it arrives</div>
                                </div>
                                <span style={{ marginLeft: 'auto', fontSize: '20px' }}>💵</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div>
                    <div style={{ position: 'sticky', top: '100px', background: 'var(--surface-hover)', padding: '25px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Order Summary</h3>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <span>Price ({cart.length} items)</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--success)', fontWeight: '500' }}>
                                <span>Discount Coupon</span>
                                <span>-${discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                            <span>Delivery Charges</span>
                            <span style={{ color: 'var(--success)' }}>FREE</span>
                        </div>

                        <div style={{ borderTop: '2px dashed var(--border)', margin: '20px 0' }}></div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', fontWeight: '800', fontSize: '20px', color: 'var(--text-main)' }}>
                            <span>Total Payable</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>

                        {/* Coupon Input */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', gap: '10' }}>
                                <input
                                    type="text"
                                    placeholder="Enter Promo Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    style={{ flex: 1, padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text-main)' }}
                                />
                                <button onClick={handleApplyCoupon} className="btn" style={{ padding: '10px 20px', background: '#0f172a', color: 'white', borderRadius: '8px' }}>Apply</button>
                            </div>
                            <button
                                onClick={handleAutoApplyCoupon}
                                style={{ background: 'transparent', border: '1px dashed var(--accent)', color: 'var(--accent)', padding: '8px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}
                            >
                                ✨ Auto-Apply Best Coupon
                            </button>
                            {errors.coupon && <div style={{ color: '#dc2626', fontSize: '12px' }}>{errors.coupon}</div>}
                        </div>

                        {/* TechCoins Redemption */}
                        {points > 0 && (
                            <div style={{ marginBottom: '25px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: '600', color: '#15803d' }}>
                                    <span>Redeem TechCoins</span>
                                    <span>{points} Available</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.min(points, Math.ceil(cartTotal * 10))} // Cap at order total or max points
                                        step="10"
                                        value={redeemedPoints}
                                        onChange={(e) => setRedeemedPoints(parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: '#10b981' }}
                                    />
                                    <span style={{ minWidth: '60px', textAlign: 'right', fontWeight: 'bold' }}>{redeemedPoints} pts</span>
                                </div>
                                <div style={{ fontSize: '12px', color: '#166534', marginTop: '5px', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Rate: 10 pts = $1.00</span>
                                    <span>Save: ${(redeemedPoints / 10).toFixed(2)}</span>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={handleProceed}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '12px', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}
                        >
                            {paymentMethod === 'COD' ? `Place Order ($${finalTotal})` : `Pay $${finalTotal}`}
                        </button>

                        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '12px', color: '#94a3b8' }}>
                            Safe and Secure Payments. 100% Authentic Products.
                        </div>
                    </div>
                </div>
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
