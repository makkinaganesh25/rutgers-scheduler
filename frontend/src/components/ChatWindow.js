// // src/components/ChatWindow.js
// import React, { useState, useEffect, useRef } from 'react';
// import api from '../api';             // ← import the shared axios
// import './ChatWindow.css';

// export default function ChatWindow({ onClose }) {
//   const [messages, setMessages] = useState([
//     { from: 'bot', type: 'text', text: '👋 Hi there! Ask me about your CSO duties or officer info.' }
//   ]);
//   const [input, setInput]     = useState('');
//   const [loading, setLoading] = useState(false);
//   const endRef = useRef();

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading]);

//   const send = async () => {
//     const q = input.trim();
//     if (!q) return;
//     setMessages(m => [...m, { from: 'user', type: 'text', text: q }]);
//     setLoading(true);
//     setInput('');

//     try {
//       // ← use api.post instead of fetch
//       const res = await api.post('/api/chat', { query: q });
//       const payload = res.data;

//       if (payload.type === 'officer') {
//         const { name, rank, email, phone } = payload.data;
//         setMessages(m => [
//           ...m,
//           { from: 'bot', type: 'officer', data: { name, rank, email, phone } }
//         ]);
//       } else {
//         setMessages(m => [
//           ...m,
//           { from: 'bot', type: 'text', text: payload.text }
//         ]);
//       }
//     } catch (err) {
//       console.error('Chatbot error:', err);
//       setMessages(m => [
//         ...m,
//         { from: 'bot', type: 'text', text: 'Sorry—something went wrong.' }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-window">
//       <header className="chat-header">
//         <span>CSO Assistant</span>
//         <button className="close-btn" onClick={onClose}>×</button>
//       </header>

//       <div className="messages">
//         {messages.map((m,i) => (
//           <div key={i} className={`message ${m.from}`}>
//             {m.type === 'officer' ? (
//               <div className="officer-card">
//                 <strong>{m.data.name}</strong> ({m.data.rank})<br/>
//                 ✉️ {m.data.email}<br/>
//                 📞 {m.data.phone}
//               </div>
//             ) : (
//               <div className="text">{m.text}</div>
//             )}
//           </div>
//         ))}
//         {loading && <div className="message bot">Typing…</div>}
//         <div ref={endRef} />
//       </div>

//       <div className="input-area">
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && send()}
//           placeholder="Type your question…"
//         />
//         <button onClick={send} disabled={loading}>Send</button>
//       </div>
//     </div>
//   );
// }

// // src/components/ChatWindow.js
// import React, { useState, useEffect, useRef } from 'react';
// import api from '../api';
// import './ChatWindow.css';

// // Import UUID generator
// import { v4 as uuidv4 } from 'uuid';

// export default function ChatWindow({ onClose }) {
//   const [messages, setMessages] = useState([
//     { from: 'bot', type: 'text', text: '👋 Hi there! Ask me about your CSO duties, officer info, or your shift schedule.' }
//   ]);
//   const [input, setInput] = useState('');
//   const [loading, setLoading] = useState(false);
//   const endRef = useRef();

//   // New state for session ID, get from local storage or generate new
//   const [sessionId, setSessionId] = useState(() => {
//     const storedSessionId = localStorage.getItem('chatSessionId');
//     return storedSessionId || uuidv4();
//   });

//   // IMPORTANT: For testing personalized shifts, hardcode a userId here for now.
//   // In a real app, this would come from user authentication (e.g., from a login context).
//   const currentUserId = 1; // <--- CHANGE THIS TO A VALID USER ID FROM YOUR 'users' TABLE FOR TESTING SHIFTS

//   // Effect to save session ID to local storage when it changes
//   useEffect(() => {
//     localStorage.setItem('chatSessionId', sessionId);
//   }, [sessionId]);

//   useEffect(() => {
//     endRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages, loading]);

//   const send = async () => {
//     const q = input.trim();
//     if (!q) return;

//     setMessages(m => [...m, { from: 'user', type: 'text', text: q }]);
//     setLoading(true);
//     setInput('');

//     try {
//       // Pass the sessionId and userId in the request body
//       const res = await api.post('/api/chat', {
//         query: q,
//         sessionId: sessionId,
//         userId: currentUserId // Sending the placeholder user ID
//       });
//       const payload = res.data;

//       // Update sessionId if the backend returned a new one (e.g., initial call)
//       if (payload.sessionId && payload.sessionId !== sessionId) {
//         setSessionId(payload.sessionId);
//       }

//       if (payload.type === 'officer') {
//         const { name, rank, email, phone } = payload.data;
//         setMessages(m => [
//           ...m,
//           { from: 'bot', type: 'officer', data: { name, rank, email, phone } }
//         ]);
//       } else {
//         setMessages(m => [
//           ...m,
//           { from: 'bot', type: 'text', text: payload.text }
//         ]);
//       }
//     } catch (err) {
//       console.error('Chatbot error:', err);
//       setMessages(m => [
//         ...m,
//         { from: 'bot', type: 'text', text: 'Sorry—something went wrong.' }
//       ]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chat-window">
//       <header className="chat-header">
//         <span>CSO Assistant</span>
//         <button className="close-btn" onClick={onClose}>×</button>
//       </header>
//       <div className="messages">
//         {messages.map((m,i) => (
//           <div key={i} className={`message ${m.from}`}>
//             {m.type === 'officer' ? (
//               <div className="officer-card">
//                 <strong>{m.data.name}</strong> ({m.data.rank})<br/>
//                 ✉️ {m.data.email}<br/>
//                 📞 {m.data.phone}
//               </div>
//             ) : (
//               <div className="text">{m.text}</div>
//             )}
//           </div>
//         ))}
//         {loading && <div className="message bot">Typing…</div>}
//         <div ref={endRef} />
//       </div>
//       <div className="input-area">
//         <input
//           value={input}
//           onChange={e => setInput(e.target.value)}
//           onKeyDown={e => e.key === 'Enter' && send()}
//           placeholder="Type your question…"
//         />
//         <button onClick={send} disabled={loading}>Send</button>
//       </div>
//     </div>
//   );
// }


// src/components/ChatWindow.js
import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import './ChatWindow.css';
import { v4 as uuidv4 } from 'uuid';

export default function ChatWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { from: 'bot', type: 'text', text: '👋 Hi there! Ask me about your CSO duties, officer info, or your shift schedule.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  const [sessionId, setSessionId] = useState(() => {
    const storedSessionId = localStorage.getItem('chatSessionId');
    return storedSessionId || uuidv4();
  });

  const currentUserId = 1; // <--- This will eventually come from user authentication

  useEffect(() => {
    localStorage.setItem('chatSessionId', sessionId);
  }, [sessionId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (queryToSend = input.trim()) => {
    if (!queryToSend) return;

    setMessages(m => [...m, { from: 'user', type: 'text', text: queryToSend }]);
    setLoading(true);
    setInput('');

    try {
      const res = await api.post('/api/chat', {
        query: queryToSend,
        sessionId: sessionId,
        userId: currentUserId
      });
      const payload = res.data;

      if (payload.sessionId && payload.sessionId !== sessionId) {
        setSessionId(payload.sessionId);
      }

      if (payload.type === 'officer') {
        const { name, rank, email, phone } = payload.data;
        setMessages(m => [
          ...m,
          { from: 'bot', type: 'officer', data: { name, rank, email, phone } }
        ]);
      } else if (payload.type === 'name_suggestions') { // Handle name suggestions
        setMessages(m => [
          ...m,
          { from: 'bot', type: 'text', text: payload.text },
          {
            from: 'bot',
            type: 'suggestions', // New type to render clickable suggestions
            data: payload.suggestions
          }
        ]);
      } else {
        setMessages(m => [
          ...m,
          { from: 'bot', type: 'text', text: payload.text }
        ]);
      }
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages(m => [
        ...m,
        { from: 'bot', type: 'text', text: 'Sorry—something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // When a suggestion is clicked, send it as a new user query
    send(suggestion);
  };

  return (
    <div className="chat-window">
      <header className="chat-header">
        <span>CSO Assistant</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </header>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.from}`}>
            {m.type === 'officer' ? (
              <div className="officer-card">
                <strong>{m.data.name}</strong> ({m.data.rank})<br/>
                ✉️ {m.data.email}<br/>
                📞 {m.data.phone}
              </div>
            ) : m.type === 'suggestions' ? (
                <div className="suggestions-list">
                    {m.data.map((suggestion, idx) => (
                        <button key={idx} className="suggestion-chip" onClick={() => handleSuggestionClick(suggestion)}>
                            {suggestion}
                        </button>
                    ))}
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
        <button onClick={() => send()} disabled={loading}>Send</button>
      </div>
    </div>
  );
}
