import React, { useState } from 'react';

const StripePayment = ({ total, onPaymentSuccess }) => {
    const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    const formatCardNumber = (value) => {
        return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim().substring(0, 19);
    };

    const handleInput = (e) => {
        const { name, value } = e.target;
        if (name === 'number') {
            setCardData(prev => ({ ...prev, [name]: formatCardNumber(value) }));
        } else if (name === 'expiry') {
            let val = value.replace(/\W/gi, '');
            if (val.length > 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
            setCardData(prev => ({ ...prev, [name]: val }));
        } else {
            setCardData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (cardData.number.replace(/\s/g, '').length < 16) return setError('Invalid Card Number');
        if (cardData.cvc.length < 3) return setError('Invalid CVC');

        setProcessing(true);
        // Simulate Banking Network Delay
        setTimeout(() => {
            setProcessing(false);
            onPaymentSuccess();
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>💳</span> Pay with Card
            </h3>

            <div style={{ position: 'relative' }}>
                <input
                    name="number"
                    value={cardData.number}
                    onChange={handleInput}
                    placeholder="0000 0000 0000 0000"
                    maxLength="19"
                    required
                    style={{ width: '100%', padding: '12px', paddingLeft: '45px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px', letterSpacing: '2px' }}
                />
                <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#888' }}>🔒</span>
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
                <input
                    name="expiry"
                    value={cardData.expiry}
                    onChange={handleInput}
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <input
                    name="cvc"
                    value={cardData.cvc}
                    onChange={handleInput}
                    type="password"
                    placeholder="CVC"
                    maxLength="3"
                    required
                    style={{ flex: 1, padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
            </div>

            <input
                name="name"
                value={cardData.name}
                onChange={handleInput}
                placeholder="Cardholder Name"
                required
                style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
            />

            {error && <div style={{ color: 'red', fontSize: '13px' }}>{error}</div>}

            <button
                type="submit"
                disabled={processing}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', background: processing ? '#ccc' : '#2874f0' }}
            >
                {processing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
            </button>
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#888', marginTop: '10px' }}>
                <span style={{ display: 'inline-block', marginRight: '5px' }}>🔒</span>
                Secure 256-bit SSL Encrypted Payment
            </div>
        </form>
    );
};

export default StripePayment;
