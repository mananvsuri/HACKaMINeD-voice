import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Send, ShoppingBag } from 'lucide-react';
import { submitAudioOrder, submitTextOrder, confirmOrder } from '../api/api';
import PaymentModal from '../components/PaymentModal';
import OrderReceipt from '../components/OrderReceipt';

export default function VoiceCopilot() {
    const [isRecording, setIsRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [orderState, setOrderState] = useState(null);
    const [showPayment, setShowPayment] = useState(false);
    const [finalReceipt, setFinalReceipt] = useState(null);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.current.push(event.data);
                }
            };

            mediaRecorder.current.onstop = async () => {
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                await handleAudioSubmission(audioBlob);
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic", err);
            alert("Microphone access is required for the Voice Copilot.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current) {
            mediaRecorder.current.stop();
            setIsRecording(false);

            // Stop all tracks to release mic
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleAudioSubmission = async (blob) => {
        setProcessing(true);
        try {
            const response = await submitAudioOrder(blob, orderState?.items || []);
            setOrderState(response);
        } catch (err) {
            console.error("Failed to process order", err);
            alert("Error processing voice order. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const handleTextSubmit = async (e) => {
        e.preventDefault();
        if (!transcript.trim()) return;

        setProcessing(true);
        try {
            const response = await submitTextOrder(transcript, orderState?.items || []);
            setOrderState(response);
            setTranscript('');
        } catch (err) {
            console.error(err.response?.data || err);
            alert(`API Error: ${err.response?.data?.detail || err.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleCheckout = () => {
        setShowPayment(true);
    };

    const handlePaymentSuccess = async () => {
        setShowPayment(false);
        setProcessing(true);
        try {
            // Send the entire ParsedVoiceOrder to backend to create DB records
            const receipt = await confirmOrder(orderState);
            setFinalReceipt(receipt);
            setOrderState(null); // clear cart
        } catch (err) {
            console.error(err);
            alert("Failed to confirm order with backend.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="voice-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', height: 'calc(100vh - 4rem)' }}>
            {/* Voice Interface */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                    {/* Animated Mic Button */}
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        style={{
                            width: '120px', height: '120px', borderRadius: '50%', border: 'none',
                            background: isRecording ? 'rgba(239, 35, 60, 0.2)' : 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                            color: isRecording ? 'var(--danger)' : '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: isRecording ? '0 0 50px rgba(239,35,60,0.5)' : '0 10px 30px rgba(157,78,221,0.4)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            transform: isRecording ? 'scale(1.1)' : 'scale(1)'
                        }}
                    >
                        {processing ? <Loader2 size={40} className="spinner" style={{ animation: 'spin 1s linear infinite' }} /> :
                            isRecording ? <Square size={40} fill="currentColor" /> : <Mic size={50} />}
                    </button>

                    <h2 style={{ marginTop: '2rem', fontSize: '1.5rem', fontWeight: 500 }}>
                        {processing ? "Processing Order..." :
                            isRecording ? "Listening..." : "Tap to Order"}
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Try: "Mujhe ek butter chicken aur do garlic naan chahiye, make it spicy"
                    </p>
                </div>

                {/* Text Fallback */}
                <form onSubmit={handleTextSubmit} style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', padding: '1rem', background: 'var(--surface)', borderRadius: '8px' }}>
                    <input
                        type="text"
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        placeholder="Or type your order here..."
                        style={{ flex: 1, background: 'transparent', border: 'none', color: 'var(--text)', outline: 'none', fontSize: '1rem' }}
                        disabled={processing || isRecording}
                    />
                    <button type="submit" disabled={processing || isRecording || !transcript.trim()} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                        <Send size={20} />
                    </button>
                </form>
            </div>

            {/* Live Order Cart */}
            <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <ShoppingBag size={20} color="var(--primary)" /> Current Order
                </h3>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {orderState ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ padding: '1rem', background: 'rgba(6, 214, 160, 0.1)', borderLeft: '3px solid var(--success)', borderRadius: '4px' }}>
                                <span style={{ fontWeight: 600, color: 'var(--success)' }}>AI Status: </span>
                                {orderState.order_summary_text}
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <h4 style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>PARSED ITEMS</h4>
                                {orderState.items.map((item, idx) => (
                                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 0', borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.name || `Item ${item.menu_item_id}`} <span style={{ color: 'var(--primary)' }}>x{item.quantity}</span></div>
                                            {item.modifiers && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Modifiers: {item.modifiers}</div>}
                                        </div>
                                    </div>
                                ))}
                                {orderState.items.length > 0 && (
                                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '1rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                        <span>Estimated Total:</span>
                                        <span>₹{(orderState.estimated_total || 0).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '3rem' }}>
                            Cart is empty. Start speaking to add items!
                        </div>
                    )}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <button
                        onClick={handleCheckout}
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', background: 'var(--success)', color: '#fff', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', opacity: orderState?.items?.length ? 1 : 0.5 }}
                        disabled={!orderState?.items?.length}
                    >
                        Confirm Order
                    </button>
                </div>
            </div>

            {/* Overlays */}
            {showPayment && (
                <PaymentModal
                    order={orderState}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPayment(false)}
                />
            )}

            {finalReceipt && (
                <OrderReceipt
                    order={finalReceipt}
                    onClose={() => setFinalReceipt(null)}
                />
            )}
        </div>
    );
}
