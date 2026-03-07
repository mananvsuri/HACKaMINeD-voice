import React, { useEffect, useState } from 'react';
import { fetchInsights, fetchCombos } from '../api/api';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, ShoppingBag, DollarSign, Star, Info, ChevronRight, MessageSquare, Package, Zap, Loader2, Send } from 'lucide-react';
import { generateMarketingCampaign } from '../api/api';

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="glass-panel" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', minWidth: '200px' }}>
                <p style={{ fontWeight: 600, color: '#fff', fontSize: '1.2rem', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    {data.name}
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '10px' }}>{data.profitability_category}</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Cont. Margin:</span>
                    <span style={{ textAlign: 'right', fontWeight: 600, color: data.margin_percentage > 50 ? 'var(--success)' : 'var(--danger)' }}>₹{data.contribution_margin.toFixed(0)} ({data.margin_percentage.toFixed(0)}%)</span>

                    <span style={{ color: 'var(--text-muted)' }}>Velocity:</span>
                    <span style={{ textAlign: 'right', fontWeight: 600 }}>{data.sales_velocity.toFixed(2)}/day</span>

                    <span style={{ color: 'var(--text-muted)' }}>Revenue:</span>
                    <span style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>₹{data.total_revenue.toFixed(0)}</span>
                </div>
                <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    <strong>Action:</strong> {data.action_recommendation}
                </div>
            </div>
        );
    }
    return null;
};

export default function Dashboard() {
    const [insights, setInsights] = useState([]);
    const [combos, setCombos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Hackathon Feature States
    const [campaignModal, setCampaignModal] = useState({ isOpen: false, loading: false, item: null, text: '' });
    const [surgedItems, setSurgedItems] = useState({});
    const [restockedItems, setRestockedItems] = useState({});

    useEffect(() => {
        async function loadData() {
            try {
                const insightsData = await fetchInsights();
                const combosData = await fetchCombos();
                setInsights(insightsData);
                setCombos(combosData);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return (
        <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <div className="spinner" style={{ width: 40, height: 40, border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading Revenue Engine...</span>
        </div>
    );

    const totalRevenue = insights.reduce((sum, item) => sum + item.total_revenue, 0);
    const totalVolume = insights.reduce((sum, item) => sum + (item.sales_velocity * 30), 0);
    const avgMarginPct = insights.reduce((sum, item) => sum + item.margin_percentage, 0) / (insights.length || 1);

    // Profitability Categories for the lists
    const toPromote = insights.filter(i => i.profitability_category === 'Puzzle').sort((a, b) => b.contribution_margin - a.contribution_margin).slice(0, 3);
    const toReprice = insights.filter(i => i.profitability_category === 'Plowhorse').sort((a, b) => b.sales_velocity - a.sales_velocity).slice(0, 3);
    const lowStockAlerts = insights.filter(i => i.days_to_deplete < 5).sort((a, b) => a.days_to_deplete - b.days_to_deplete).slice(0, 3);

    const handleGeneratePromo = async (item) => {
        setCampaignModal({ isOpen: true, loading: true, item, text: '' });
        try {
            const data = await generateMarketingCampaign(item.name, 15);
            setCampaignModal({ isOpen: true, loading: false, item, text: data.campaign_text });
        } catch (err) {
            setCampaignModal({ isOpen: true, loading: false, item, text: "Error generating campaign. Please try again." });
        }
    };

    const handleSurge = (itemId) => {
        setSurgedItems(prev => ({ ...prev, [itemId]: true }));
    };

    const handleRestock = (itemId) => {
        setRestockedItems(prev => ({ ...prev, [itemId]: true }));
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '2.4rem', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>Revenue Engine</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.4rem' }}>Live profitability analysis across your menu.</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 214, 160, 0.1)', color: 'var(--success)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)', animation: 'pulse 2s infinite' }} />
                    System Active
                </div>
            </header>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--success) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Gross Revenue</span>
                        <div style={{ background: 'rgba(6, 214, 160, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                            <DollarSign size={20} color="var(--success)" />
                        </div>
                    </div>
                    <div className="kpi-value">
                        ₹{totalRevenue.toLocaleString()}
                    </div>
                </div>

                <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Items Sold</span>
                        <div style={{ background: 'rgba(157, 78, 221, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                            <ShoppingBag size={20} color="var(--primary)" />
                        </div>
                    </div>
                    <div className="kpi-value">
                        {totalVolume.toLocaleString()}
                    </div>
                </div>

                <div className="glass-panel" style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, width: '150px', height: '150px', background: 'radial-gradient(circle, var(--secondary) 0%, transparent 70%)', opacity: 0.1, transform: 'translate(30%, -30%)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '1.1rem', color: '#fff' }}>Avg Profit Margin</span>
                        <div style={{ background: 'rgba(255, 158, 0, 0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                            <TrendingUp size={20} color="var(--secondary)" />
                        </div>
                    </div>
                    <div className="kpi-value">
                        {avgMarginPct.toFixed(1)}%
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
                {/* Scatter Plot: Menu Matrix */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600 }}>Profitability Matrix</h3>
                        <Tooltip content={<div className="glass-panel" style={{ padding: '0.5rem' }}>Plot of Margin % vs Output Volume</div>}>
                            <Info size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                        </Tooltip>
                    </div>

                    <div style={{ flex: 1, minHeight: '350px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis type="number" dataKey="sales_velocity" name="Velocity" unit=" /day" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <YAxis type="number" dataKey="margin_percentage" name="Margin" unit="%" stroke="var(--text-muted)" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickLine={false} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.2)' }} />
                                <Scatter name="Menu Items" data={insights} fill="var(--primary)">
                                    {insights.map((entry, index) => {
                                        let color = "var(--primary)";
                                        if (entry.profitability_category === 'Puzzle') color = "var(--secondary)";
                                        if (entry.profitability_category === 'Plowhorse') color = "var(--danger)";
                                        if (entry.profitability_category === 'Star') color = "var(--success)";
                                        // Size the dot based on relative volume/revenue
                                        const radius = Math.max(6, Math.min(20, (entry.total_revenue / 1000) * 8));
                                        return <Cell key={`cell-${index}`} fill={color} r={radius} />;
                                    })}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }}></div> Star Items</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 8px var(--secondary)' }}></div> High Margin / Low Vol</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 8px var(--danger)' }}></div> Low Margin / High Vol</span>
                    </div>
                </div>

                {/* AI Alerts Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>

                    {/* Predictive Inventory (Hackathon Feature) */}
                    {lowStockAlerts.length > 0 && (
                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff' }}>
                                <Package size={20} color="var(--primary)" /> Smart Stock Alerts
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {lowStockAlerts.map(item => (
                                    <div key={item.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.1)', borderLeft: '3px solid var(--primary)', borderRadius: '8px', padding: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{item.name}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--danger)', marginTop: '0.2rem' }}>
                                                    Depletes in {Math.max(1, Math.round(item.days_to_deplete))} days ({item.current_stock} left)
                                                </div>
                                            </div>
                                            {restockedItems[item.id] ? (
                                                <span style={{ fontSize: '0.8rem', color: 'var(--success)', fontWeight: 600, padding: '0.3rem 0.6rem', background: 'rgba(6, 214, 160, 0.1)', borderRadius: '20px' }}>Ordered ✓</span>
                                            ) : (
                                                <button onClick={() => handleRestock(item.id)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem', background: 'rgba(157, 78, 221, 0.2)', border: '1px solid var(--primary)', color: 'var(--primary)' }}>
                                                    1-Click Restock
                                                </button>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Petpooja Supplier Hub: Recommended {item.recommended_restock_quantity} units.
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertTriangle size={20} color="var(--secondary)" /> Revenue AI Alerts
                        </h3>

                        <div style={{ overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                            {toPromote.map(item => (
                                <div key={item.id} style={{ background: 'rgba(255, 158, 0, 0.05)', border: '1px solid rgba(255,158,0,0.2)', borderLeft: '3px solid var(--secondary)', borderRadius: '8px', padding: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>Puzzle (Under-promoted)</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--secondary)', background: 'rgba(255,158,0,0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>₹{item.contribution_margin.toFixed(0)} Margin</div>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.action_recommendation}</div>
                                </div>
                            ))}

                            {toReprice.map(item => (
                                <div key={item.id} style={{ background: 'rgba(239, 35, 60, 0.05)', border: '1px solid rgba(239,35,60,0.2)', borderLeft: '3px solid var(--danger)', borderRadius: '8px', padding: '1rem', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                        <div style={{ fontWeight: 600, color: '#fff' }}>Plowhorse (Margin Risk)</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--danger)', background: 'rgba(239,35,60,0.1)', padding: '0.1rem 0.5rem', borderRadius: '12px' }}>{item.sales_velocity.toFixed(1)}/day Vol.</div>
                                    </div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text)', marginBottom: '0.2rem' }}>{item.name}</div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.action_recommendation}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Smart Combo Recommendations */}
                <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Star size={20} color="var(--primary)" /> Smart Combo Generator
                        </h3>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                            View All <ChevronRight size={16} />
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {combos.map((combo, idx) => (
                            <div key={idx} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.3)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    {combo.items.map((c_item, i) => (
                                        <React.Fragment key={i}>
                                            <span style={{ fontWeight: 600, color: '#fff' }}>{c_item}</span>
                                            {i < combo.items.length - 1 && <span style={{ color: 'var(--text-muted)' }}>+</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                                    {combo.suggestion}
                                </p>
                                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <TrendingUp size={14} color="var(--primary)" /> Ordered together {combo.frequency} times
                                    </div>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.6rem', borderRadius: '4px', color: '#fff' }}>Apply Combo</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Campaign Modal */}
            {campaignModal.isOpen && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-panel fade-in" style={{ width: '100%', maxWidth: '500px', position: 'relative' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MessageSquare size={24} color="var(--secondary)" /> AI Campaign Generator
                        </h2>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                            Generating localized promotional message for <strong>{campaignModal.item?.name}</strong> to push underperforming high-margin stock.
                        </p>

                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {campaignModal.loading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                                    <Loader2 size={24} className="spin" color="var(--secondary)" />
                                    Writing campaign...
                                </div>
                            ) : (
                                <div style={{ width: '100%', fontSize: '1rem', lineHeight: 1.5, color: '#fff', whiteSpace: 'pre-wrap' }}>
                                    {campaignModal.text}
                                </div>
                            )}
                        </div>

                        {!campaignModal.loading && (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <button className="btn-secondary" onClick={() => setCampaignModal({ isOpen: false, loading: false, item: null, text: '' })}>Close</button>
                                <button className="btn-primary" onClick={() => { alert("Campaign dispatched to Petpooja CRM!"); setCampaignModal(prev => ({ ...prev, isOpen: false })); }} style={{ flex: 1, gap: '0.5rem', background: '#25D366' }}>
                                    <Send size={16} /> Broadcast via WhatsApp
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse {
                    0% { box-shadow: 0 0 0 0 rgba(6, 214, 160, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(6, 214, 160, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(6, 214, 160, 0); }
                }
            `}</style>
        </div>
    );
}
