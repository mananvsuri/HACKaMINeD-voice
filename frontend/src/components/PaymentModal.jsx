import React, { useState } from 'react';
import { CreditCard, CheckCircle, Loader2, X } from 'lucide-react';

export default function PaymentModal({ order, onPaymentSuccess, onCancel }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Approximate total calculating it simply client side for display,
    // the backend will recalculate actual total.
    // In a real app the order object from Groq should have prices, 
    // but we can just say "Proceed to Pay" as the prompt.

    const simulatePayment = () => {
        setIsProcessing(true);

        // Simulate a 2 second payment gateway process
        setTimeout(() => {
            setIsProcessing(false);
            setIsSuccess(true);

            // Auto close/proceed after showing success checkmark
            setTimeout(() => {
                onPaymentSuccess();
            }, 1500);
        }, 2000);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
            <div className="glass-panel" style={{ width: '400px', maxWidth: '90%', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>

                {isSuccess ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                        <CheckCircle size={64} color="var(--success)" style={{ margin: '0 auto 1rem', animation: 'scaleUp 0.5s ease' }} />
                        <h2 style={{ color: 'var(--success)' }}>Payment Successful!</h2>
                        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Your order is being sent to the kitchen...</p>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <CreditCard color="var(--primary)" /> Complete Checkout
                            </h2>
                            <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X />
                            </button>
                        </div>

                        <div style={{ padding: '1rem', background: 'var(--surface-light)', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Order Details</p>
                            <div style={{ fontWeight: 500 }}>{order.order_summary_text}</div>
                            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem', opacity: 0.8 }}>
                                {order.items.length} items parsed from voice.
                            </div>
                        </div>

                        <button
                            onClick={simulatePayment}
                            disabled={isProcessing}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '8px',
                                background: 'linear-gradient(90deg, var(--primary), var(--primary-dark))',
                                color: '#fff', border: 'none', fontWeight: 600, fontSize: '1rem',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                opacity: isProcessing ? 0.8 : 1
                            }}
                        >
                            {isProcessing ? <Loader2 className="spinner" size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Pay Now'}
                        </button>
                    </>
                )}
            </div>

            <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes scaleUp {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
        </div>
    );
}
