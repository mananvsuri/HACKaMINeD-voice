import React, { useEffect, useState } from 'react';
import { fetchOrders } from '../api/api';
import { Loader2, Receipt, Inbox, Clock } from 'lucide-react';
import OrderReceipt from '../components/OrderReceipt';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        async function getOrders() {
            try {
                const data = await fetchOrders();
                setOrders(data);
            } catch (err) {
                console.error("Failed to fetch order history", err);
            } finally {
                setLoading(false);
            }
        }
        getOrders();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div className="order-history-container">
            <header style={{ marginBottom: '2.5rem' }}>
                <h1 style={{ fontSize: '2.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Inbox color="var(--primary)" /> Order History
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Review past AI and manual orders.</p>
            </header>

            {orders.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                    <Receipt size={64} color="var(--surface-light)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h2 style={{ color: 'var(--text-muted)' }}>No Orders Yet</h2>
                    <p>Orders processed by Voice Copilot will appear here.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Order ID</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Date & Time</th>
                                <th style={{ padding: '1.2rem', textAlign: 'left' }}>Items</th>
                                <th style={{ padding: '1.2rem', textAlign: 'right' }}>Total (₹)</th>
                                <th style={{ padding: '1.2rem', textAlign: 'center' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s', cursor: 'pointer' }} onClick={() => setSelectedOrder(order)} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '1.2rem', fontWeight: 'bold' }}>#{order.id.toString().padStart(4, '0')}</td>
                                    <td style={{ padding: '1.2rem', color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} />
                                            {new Date(order.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1.2rem' }}>
                                        <span style={{ display: 'inline-block', background: 'var(--primary-dark)', color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
                                            {order.items.reduce((sum, i) => sum + i.quantity, 0)} items
                                        </span>
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'right', fontWeight: '600', color: 'var(--success)' }}>
                                        ₹{order.total_amount.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '1.2rem', textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}
                                            style={{ background: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}
                                            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--primary)'; }}
                                        >
                                            View Receipt
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedOrder && (
                <OrderReceipt
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
}
