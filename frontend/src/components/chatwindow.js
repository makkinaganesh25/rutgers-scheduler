import React, { useState, useEffect, useRef } from 'react';
import './ChatWindow.css';

// File: src/components/ChatWindow.js
export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', type: 'text', text: '👋 Hi there! Ask me about your CSO duties or officer info.' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  // auto-scroll to bottom
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const q = input.trim();
    if (!q) return;
    setMessages(m => [...m, { from: 'user', type: 'text', text: q }]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('http://localhost:50001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const payload = await res.json();

      // format response
      if (payload.type === 'officer') {
        const { name, rank, email, phone } = payload.data;
        setMessages(m => [
          ...m,
          {
            from: 'bot',
            type: 'officer',
            data: { name, rank, email, phone }
          }
        ]);
      } else {
        setMessages(m => [
          ...m,
          { from: 'bot', type: 'text', text: payload.text }
        ]);
      }

    } catch (err) {
      console.error(err);
      setMessages(m => [
        ...m,
        { from: 'bot', type: 'text', text: 'Sorry—something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <span>CSO Assistant</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </header>

      <div className="messages">
        {messages.map((m,i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.type === 'officer' ? (
              <div className="officer-card">
                <strong>{m.data.name}</strong> ({m.data.rank})<br/>
                ✉️ {m.data.email}<br/>
                📞 {m.data.phone}
              </div>
            ) : (
              <div className="text">{m.text}</div>
            )}
          </div>
        ))}
        {loading && <div className="message bot">Typing…</div>}
        <div ref={endRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type your question…"
        />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
