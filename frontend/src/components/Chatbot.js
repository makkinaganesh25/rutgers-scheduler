// File: src/components/Chatbot.js
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import './Chatbot.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chatbot-container">
      {open && <ChatWindow onClose={() => setOpen(false)} />}
      <button
        className="chat-toggle-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? '×' : '💬'}
      </button>
    </div>
  );
}
