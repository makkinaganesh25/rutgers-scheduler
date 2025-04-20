import { useState, useEffect, useRef } from 'react';
import './chatwindow.css';


export default function ChatWindow() {
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me about your CSO duties.' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  // auto‑scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(m => [...m, { from: 'user', text: userText }]);
    setLoading(true);
    setInput('');

    try {
      const res = await fetch('http://localhost:50001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText }),
      });
      const { answer } = await res.json();
      setMessages(m => [...m, { from: 'bot', text: answer }]);
    } catch (err) {
      console.error(err);
      setMessages(m => [
        ...m,
        { from: 'bot', text: 'Sorry—something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m,i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.text}
          </div>
        ))}
        {loading && <div className="message bot">Typing…</div>}
        <div ref={endRef}/>
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask a question…"
        />
        <button onClick={send} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
