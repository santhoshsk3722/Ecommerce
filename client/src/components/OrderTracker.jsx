import React from 'react';

const OrderTracker = ({ status, trackingId, courier, estimatedDelivery }) => {
    const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Normalize status for comparison
    const normalizedStatus = (status || '').toLowerCase();

    // Map status to index (case-insensitive)
    let currentStepIndex = steps.findIndex(s => s.toLowerCase() === normalizedStatus);

    // Fallback/Mapping
    if (currentStepIndex === -1) {
        if (normalizedStatus === 'placed') currentStepIndex = 0; // Map Placed -> Processing
        else currentStepIndex = 0; // Default to start
    }

    // Handle Cancelled State
    if (normalizedStatus === 'cancelled') {
        return (
            <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--error)', borderRadius: '8px', color: 'var(--error)', textAlign: 'center', fontWeight: 'bold' }}>
                🚫 Order Cancelled
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', width: '100%', background: 'var(--surface-hover)', borderRadius: '8px', marginTop: '10px' }}>
            {/* Shipment Info Header */}
            {(trackingId || estimatedDelivery) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '14px', flexWrap: 'wrap', gap: '10px' }}>
                    {trackingId && (
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Tracking ID: </span>
                            <span style={{ fontWeight: 'bold' }}>{trackingId}</span>
                            {courier && <span style={{ marginLeft: '5px', color: 'var(--primary)', fontWeight: 'bold' }}>({courier})</span>}
                        </div>
                    )}
                    {estimatedDelivery && (
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>Expected Delivery: </span>
                            <span style={{ fontWeight: 'bold' }}>{estimatedDelivery}</span>
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', marginTop: '10px' }}>
                {/* Progress Bar Background */}
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px', background: 'var(--border)', zIndex: 0 }} />

                {/* Active Progress Bar */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '0',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    height: '4px',
                    background: 'var(--success)',
                    zIndex: 0,
                    transition: 'width 0.5s ease-in-out'
                }} />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '25%' }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: isCompleted ? 'var(--success)' : 'var(--surface)',
                                border: isCompleted ? 'none' : '4px solid var(--border)',
                                boxShadow: '0 0 0 4px var(--surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                marginBottom: '10px',
                                transition: 'background 0.3s'
                            }}>
                                {isCompleted && '✓'}
                            </div>
                            <span style={{ fontSize: '12px', textAlign: 'center', color: isCompleted ? 'var(--success)' : 'var(--text-secondary)', fontWeight: isCompleted ? '600' : 'normal' }}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div >
    );
};

export default OrderTracker;

