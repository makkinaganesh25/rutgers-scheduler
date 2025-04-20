import { useState } from 'react';
import ChatWindow from './chatwindow';
import './Chatbot.css';

export default function Chatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div className="chatbot-container">
      {open && (
        <div className="chat-window-wrapper">
          <ChatWindow />
        </div>
      )}
      <button
        className="chat-toggle-btn"
        onClick={() => setOpen(o => !o)}
      >
        {open ? '✕' : '💬'}
      </button>
    </div>
  );
}