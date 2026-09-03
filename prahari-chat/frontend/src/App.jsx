import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [currentPsi, setCurrentPsi] = useState(null);
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    // Fetch initial PSI and summary
    useEffect(() => {
        fetchCurrentPsi();
        fetchSummary();
    }, []);

    const fetchCurrentPsi = async () => {
        try {
            const res = await axios.get(`${API_BASE}/current_psi`);
            setCurrentPsi(res.data);
        } catch (err) {
            console.error('Failed to fetch PSI', err);
        }
    };

    const fetchSummary = async () => {
        try {
            const res = await axios.get(`${API_BASE}/summary`);
            setSummary(res.data.summary);
        } catch (err) {
            console.error('Failed to fetch summary', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post(`${API_BASE}/chat`, {
                session_id: 'default',
                message: input,
            });
            const aiMsg = { role: 'assistant', content: res.data.reply };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            console.error('Chat error', err);
            const errorMsg = { role: 'assistant', content: '⚠️ Error connecting to AI. Please ensure Ollama is running.' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div style={styles.container}>
            <div style={styles.sidebar}>
                <h2>PRAHARI</h2>
                {currentPsi && (
                    <div style={styles.psiCard}>
                        <h3>Current PSI: {currentPsi.psi_score}</h3>
                        <p>Trend: {currentPsi.trend}</p>
                        <ul>
                            {Object.entries(currentPsi.factors).map(([k, v]) => (
                                <li key={k}>{k}: {v}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {summary && (
                    <div style={styles.summaryCard}>
                        <h4>AI Summary</h4>
                        <p>{summary}</p>
                    </div>
                )}
            </div>
            <div style={styles.chatArea}>
                <div style={styles.chatMessages}>
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            style={{
                                ...styles.message,
                                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                backgroundColor: msg.role === 'user' ? '#4f46e5' : '#374151',
                            }}
                        >
                            {msg.content}
                        </div>
                    ))}
                    {loading && <div style={styles.loading}>Thinking...</div>}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={sendMessage} style={styles.inputArea}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your wellbeing..."
                        style={styles.input}
                    />
                    <button type="submit" style={styles.sendButton}>Send</button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
    },
    sidebar: {
        width: '300px',
        padding: '20px',
        borderRight: '1px solid #334155',
        overflowY: 'auto',
        backgroundColor: '#1e293b',
    },
    psiCard: {
        backgroundColor: '#0f172a',
        padding: '15px',
        borderRadius: '10px',
        marginBottom: '20px',
    },
    summaryCard: {
        backgroundColor: '#0f172a',
        padding: '15px',
        borderRadius: '10px',
        fontSize: '0.9rem',
    },
    chatArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    chatMessages: {
        flex: 1,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        overflowY: 'auto',
    },
    message: {
        maxWidth: '70%',
        padding: '10px 15px',
        borderRadius: '18px',
        lineHeight: '1.5',
    },
    loading: {
        alignSelf: 'flex-start',
        color: '#94a3b8',
        fontStyle: 'italic',
    },
    inputArea: {
        display: 'flex',
        padding: '15px',
        borderTop: '1px solid #334155',
        backgroundColor: '#1e293b',
    },
    input: {
        flex: 1,
        padding: '10px',
        borderRadius: '20px',
        border: '1px solid #475569',
        backgroundColor: '#0f172a',
        color: '#f1f5f9',
        outline: 'none',
    },
    sendButton: {
        marginLeft: '10px',
        padding: '10px 20px',
        borderRadius: '20px',
        border: 'none',
        backgroundColor: '#6366f1',
        color: 'white',
        cursor: 'pointer',
    },
};

export default App;