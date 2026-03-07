import React from 'react';
import { CheckCircle, Printer, X } from 'lucide-react';

export default function OrderReceipt({ order, onClose }) {
    if (!order) return null;

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}>
            <div
                style={{
                    width: '350px',
                    background: '#fff',
                    color: '#000',
                    fontFamily: '"Courier New", Courier, monospace',
                    padding: '2rem',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', right: '1rem', top: '1rem', background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', borderBottom: '2px dashed #ccc', paddingBottom: '1rem', marginBottom: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', textTransform: 'uppercase' }}>SpicePilot POS</h2>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>Order #{order.id}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem' }}>{new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <table style={{ width: '100%', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #eee' }}>
                                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>QTY</th>
                                <th style={{ textAlign: 'left', paddingBottom: '0.5rem' }}>ITEM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <tr>
                                        <td style={{ padding: '0.5rem 0', verticalAlign: 'top' }}>{item.quantity}x</td>
                                        <td style={{ padding: '0.5rem 0', fontWeight: 'bold' }}>
                                            Item #{item.menu_item_id}
                                            {item.modifiers && (
                                                <div style={{ fontSize: '0.8rem', fontWeight: 'normal', fontStyle: 'italic', color: '#555' }}>
                                                    * {item.modifiers}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ borderTop: '2px dashed #ccc', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>TOTAL</span>
                    <span>₹{order.total_amount.toFixed(2)}</span>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.8rem', color: '#666' }}>
                    <CheckCircle size={16} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    PAID IN FULL
                    <br /><br />
                    <p style={{ fontStyle: 'italic' }}>AI Processed Order</p>
                </div>
            </div>
        </div>
    );
}
