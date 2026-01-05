import React from 'react';

const OrderTracker = ({ status }) => {
    const steps = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(status) !== -1 ? steps.indexOf(status) : 1; // Default to Processing if unknown

    return (
        <div style={{ padding: '20px 0', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                {/* Progress Bar Background */}
                <div style={{ position: 'absolute', top: '15px', left: '0', right: '0', height: '4px', background: '#e0e0e0', zIndex: 0 }} />

                {/* Active Progress Bar */}
                <div style={{
                    position: 'absolute',
                    top: '15px',
                    left: '0',
                    width: `${(currentStepIndex / (steps.length - 1)) * 100}%`,
                    height: '4px',
                    background: '#26a541',
                    zIndex: 0,
                    transition: 'width 0.3s'
                }} />

                {steps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    return (
                        <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '100px' }}>
                            <div style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                background: isCompleted ? '#26a541' : '#fff',
                                border: isCompleted ? 'none' : '4px solid #e0e0e0',
                                boxShadow: '0 0 0 4px white', // White ring to separate from bar
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                marginBottom: '10px'
                            }}>
                                {isCompleted && '✓'}
                            </div>
                            <span style={{ fontSize: '12px', textAlign: 'center', color: isCompleted ? '#212121' : '#878787', fontWeight: isCompleted ? '500' : 'normal' }}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracker;
