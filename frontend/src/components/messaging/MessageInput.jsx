import React, { useState } from 'react';
export default function MessageInput({ onSend }) {
  const [text, setText] = useState('');
  const handleSubmit = e => {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <input
        type="text"
        value={text}
        onChange={e=>setText(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
}