import React, { useState, useRef, useEffect } from 'react';
import { PhoneCall, PhoneOff, Mic, Square, Loader2, Volume2, ShoppingCart } from 'lucide-react';
import { submitConversationTurn, confirmOrder } from '../api/api';
import PaymentModal from '../components/PaymentModal';
import OrderReceipt from '../components/OrderReceipt';

export default function CallCopilot() {
    const [isOnCall, setIsOnCall] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [aiSpeaking, setAiSpeaking] = useState(false);

    // Conversation State
    const [chatHistory, setChatHistory] = useState([]);
    const [currentCart, setCurrentCart] = useState({ items: [], estimated_total: 0.0 });
    const chatHistoryRef = useRef([]);
    const currentCartRef = useRef({ items: [], estimated_total: 0.0 });

    // Checkout State
    const [showPayment, setShowPayment] = useState(false);
    const [finalReceipt, setFinalReceipt] = useState(null);

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);
    const synth = window.speechSynthesis;
    const isOnCallRef = useRef(false);
    const showPaymentRef = useRef(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const microphoneRef = useRef(null);
    const animationFrameRef = useRef(null);

    useEffect(() => {
        // Cleanup speech synthesis on component unmount
        return () => {
            if (synth.speaking) synth.cancel();
        };
    }, []);

    const startCall = () => {
        setIsOnCall(true);
        isOnCallRef.current = true;
        showPaymentRef.current = false;
        setChatHistory([]);
        setCurrentCart({ items: [], estimated_total: 0.0 });
        chatHistoryRef.current = [];
        currentCartRef.current = { items: [], estimated_total: 0.0 };

        // Initial Greeting
        const greeting = "Hi, Welcome to SpicePilot! Are you looking to place an order for delivery or pickup today?";
        setChatHistory([{ role: 'ai', content: greeting }]);
        speakText(greeting);
    };

    const endCall = () => {
        setIsOnCall(false);
        isOnCallRef.current = false;
        if (isRecording) stopRecording();
        if (synth.speaking) synth.cancel();
    };

    const speakText = (text) => {
        if (synth.speaking) synth.cancel();

        setAiSpeaking(true);
        const utterance = new SpeechSynthesisUtterance(text);

        // Optional: try to find a female Indian English voice or default
        const voices = synth.getVoices();
        const preferredVoice = voices.find(v => v.lang.includes('en-IN')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setAiSpeaking(false);
            if (isOnCallRef.current && !showPaymentRef.current) {
                setTimeout(startRecording, 300); // Tiny pause before opening mic automatically
            }
        };

        synth.speak(utterance);
    };

    const startRecording = async () => {
        try {
            if (synth.speaking) synth.cancel();

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            // Silence Detection Setup
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            await audioContextRef.current.resume();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 512;
            analyserRef.current.smoothingTimeConstant = 0.1;

            microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);
            microphoneRef.current.connect(analyserRef.current);

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            let silenceTimeout = setTimeout(() => {
                if (mediaRecorder.current && mediaRecorder.current.state === "recording" && isOnCallRef.current) {
                    stopRecording();
                }
            }, 6000); // 6s max silence if they say absolutely nothing initially

            const checkAudio = () => {
                if (!isOnCallRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
                let average = sum / dataArray.length;

                if (average > 10) {
                    clearTimeout(silenceTimeout);
                    silenceTimeout = setTimeout(() => {
                        if (mediaRecorder.current && mediaRecorder.current.state === "recording" && isOnCallRef.current) {
                            stopRecording();
                        }
                    }, 2500); // 2.5s of silence marks end of sentence
                }

                if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
                    animationFrameRef.current = requestAnimationFrame(checkAudio);
                }
            };

            checkAudio();

            mediaRecorder.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                if (isOnCallRef.current && !showPaymentRef.current) {
                    await handleAudioTurnSubmission(audioBlob);
                }
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing mic", err);
            // alert("Microphone access is required for the Call Simulator.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && mediaRecorder.current.state === "recording") {
            mediaRecorder.current.stop();
            setIsRecording(false);
            mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleAudioTurnSubmission = async (blob) => {
        setProcessing(true);
        try {
            // Read fresh stats from the refs to avoid React closure staleness
            const currentHistory = chatHistoryRef.current;
            const currentCartItems = currentCartRef.current.items || [];

            // We pass the current chatHistory to the server so Llama 3 knows what was said
            const response = await submitConversationTurn(blob, currentHistory, currentCartItems);

            // Append the turns locally
            const newHistory = [
                ...currentHistory,
                { role: 'user', content: response.user_transcript || "..." },
                { role: 'ai', content: response.ai_spoken_response }
            ];

            setChatHistory(newHistory);
            chatHistoryRef.current = newHistory;

            // Update the live cart parsing
            const newCartState = {
                items: response.items || [],
                estimated_total: response.estimated_total || 0.0
            };
            setCurrentCart(newCartState);
            currentCartRef.current = newCartState;

            // Speak the AI's response aloud
            speakText(response.ai_spoken_response);

        } catch (err) {
            console.error("Failed to process conversation part", err);
            alert("Error processing your voice. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    const confirmCheckout = () => {
        if (synth.speaking) synth.cancel();
        showPaymentRef.current = true;
        setShowPayment(true);
        if (isRecording) stopRecording();
    };

    const handlePaymentSuccess = async () => {
        setShowPayment(false);
        setProcessing(true);
        try {
            // Pack into the expected format for confirm endpoint
            const orderPayload = {
                intent: "ORDER",
                items: currentCart.items,
                order_summary_text: "Checkout from Phone Call",
                estimated_total: currentCart.estimated_total
            };
            const receipt = await confirmOrder(orderPayload);
            setFinalReceipt(receipt);
            isOnCallRef.current = false;
            setIsOnCall(false); // End the call visually
            setCurrentCart({ items: [], estimated_total: 0.0 });
            currentCartRef.current = { items: [], estimated_total: 0.0 };
            chatHistoryRef.current = [];
        } catch (err) {
            console.error(err);
            alert("Failed to confirm order with backend.");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="call-container" style={{ maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <PhoneCall color="var(--primary)" size={32} /> AI Phone Simulator
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>Experience exactly what a customer hears when they call your restaurant.</p>
            </header>

            {!isOnCall && !finalReceipt ? (
                <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
                    <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'rgba(157, 78, 221, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--primary)' }}>
                        <PhoneCall size={50} color="var(--primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Ready to Take Orders</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Simulate an incoming customer call handled by the AI.</p>
                    </div>
                    <button
                        onClick={startCall}
                        style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 600, background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '30px', cursor: 'pointer', boxShadow: '0 10px 30px rgba(6, 214, 160, 0.3)', transition: 'all 0.3s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        Simulate Incoming Call
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', flex: 1, minHeight: 0 }}>
                    {/* Active Call Interface */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                        {/* Call Header */}
                        <div style={{ paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <PhoneCall size={20} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Active Call</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--success)', fontSize: '0.9rem', fontWeight: 600 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} /> Connected
                                    </div>
                                </div>
                            </div>
                            <button onClick={endCall} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <PhoneOff size={18} /> End Call
                            </button>
                        </div>

                        {/* Transcript Feed */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', gap: '0.8rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>

                                    {msg.role === 'ai' && (
                                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(157, 78, 221, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Volume2 size={16} color="var(--primary)" />
                                        </div>
                                    )}

                                    <div style={{ background: msg.role === 'user' ? 'var(--primary-dark)' : 'var(--surface-light)', color: '#fff', padding: '1rem', borderRadius: '16px', borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px', borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px', lineHeight: 1.5 }}>
                                        {msg.content}
                                    </div>

                                </div>
                            ))}
                            {aiSpeaking && (
                                <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Volume2 size={16} /> AI is speaking...
                                </div>
                            )}
                            {processing && (
                                <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> AI is thinking...
                                </div>
                            )}
                        </div>

                        {/* Call Active Indication */}
                        <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'center' }}>
                            <div
                                style={{
                                    width: '80px', height: '80px', borderRadius: '50%',
                                    background: isRecording ? 'rgba(239, 35, 60, 0.2)' : 'var(--primary)',
                                    color: isRecording ? 'var(--danger)' : '#fff',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: isRecording ? '0 0 30px rgba(239,35,60,0.5)' : '0 10px 20px rgba(157,78,221,0.4)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: isRecording ? 'scale(1.1)' : 'scale(1)',
                                    opacity: processing ? 0.5 : 1
                                }}
                            >
                                {isRecording ? <div style={{ width: 20, height: 20, background: 'currentColor', animation: 'pulse 1s infinite' }} /> : <Mic size={35} />}
                            </div>
                        </div>
                    </div>

                    {/* Live Cart Interpretation */}
                    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                            <ShoppingCart size={20} color="var(--secondary)" /> Live Cart Memory
                        </h3>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {currentCart.items.length === 0 ? (
                                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                                    The AI is listening. Order items will appear here automatically.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {currentCart.items.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid var(--secondary)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                                <span style={{ fontWeight: 600 }}>{item.name || `Item ${item.menu_item_id}`}</span>
                                                <span style={{ background: 'var(--surface-light)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>x{item.quantity}</span>
                                            </div>
                                            {item.modifiers && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Modifiers: {item.modifiers}</div>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {currentCart.items.length > 0 && (
                            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                                    <span>Estimated Total</span>
                                    <span style={{ color: 'var(--success)' }}>₹{currentCart.estimated_total.toFixed(2)}</span>
                                </div>
                                <button
                                    onClick={confirmCheckout}
                                    style={{ width: '100%', padding: '1rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#05b084'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'var(--success)'}
                                >
                                    Push to POS Checkout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Overlays */}
            {showPayment && (
                <PaymentModal
                    order={currentCart}
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
