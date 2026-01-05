import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, onConfirm, total }) => {
    const [loading, setLoading] = useState(false);
    const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });

    if (!isOpen) return null;

    const handlePay = (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate Processing Delay
        setTimeout(() => {
            setLoading(false);
            onConfirm(); // Trigger success in parent
        }, 2000);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '400px', maxWidth: '90%' }}>
                <h2 style={{ marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>Secure Payment</h2>
                <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Total to Pay: ${total.toFixed(2)}</div>

                <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input
                        placeholder="Card Number (XXXX-XXXX-XXXX-XXXX)"
                        required
                        minLength="16"
                        maxLength="19"
                        value={cardDetails.number}
                        onChange={e => setCardDetails({ ...cardDetails, number: e.target.value })}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <input
                            placeholder="MM/YY"
                            required
                            maxLength="5"
                            value={cardDetails.expiry}
                            onChange={e => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                        />
                        <input
                            placeholder="CVV"
                            required
                            type="password"
                            maxLength="3"
                            value={cardDetails.cvv}
                            onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '80px' }}
                        />
                    </div>
                    <input
                        placeholder="Name on Card"
                        required
                        value={cardDetails.name}
                        onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })}
                        style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }} disabled={loading}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 20px', background: '#fb641b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gaps: '5px' }} disabled={loading}>
                            {loading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
