// src/components/ChatbotIcon.js
import React from 'react';
import './ChatbotIcon.css';

const RobotIcon = () => (
    <svg viewBox="0 0 100 125" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg"><g><path d="M78.5,83.5H21.5c-4.4,0-8-3.6-8-8V43.2c0-4.4,3.6-8,8-8h57c4.4,0,8,3.6,8,8v32.3C86.5,79.9,82.9,83.5,78.5,83.5z" fill="#42a5f5"/><path d="M80.5,47.2v28.3c0,2.2-1.8,4-4,4H23.5c-2.2,0-4-1.8-4-4V47.2H80.5z" fill="#e3f2fd"/><path d="M32.5,67.5c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S36.9,67.5,32.5,67.5z" fill="#212121"/><path d="M67.5,67.5c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8S71.9,67.5,67.5,67.5z" fill="#212121"/><circle cx="32.5" cy="59.5" r="3" fill="#fff"/><circle cx="67.5" cy="59.5" r="3" fill="#fff"/><path d="M50,35.2c-2.2,0-4-1.8-4-4v-11c0-2.2,1.8-4,4-4s4,1.8,4,4v11C54,33.4,52.2,35.2,50,35.2z" fill="#90a4ae"/><circle cx="50" cy="14.2" r="4" fill="#ffeb3b"/><path d="M41.5,77.5h17c1.1,0,2-0.9,2-2s-0.9-2-2-2h-17c-1.1,0-2,0.9-2,2S40.4,77.5,41.5,77.5z" fill="#ff5722"/><path d="M21.5,91.5c-1.1,0-2-0.9-2-2v-12c0-1.1,0.9-2,2-2s2,0.9,2,2v12C23.5,90.6,22.6,91.5,21.5,91.5z" fill="#78909c"/><path d="M78.5,91.5c-1.1,0-2-0.9-2-2v-12c0-1.1,0.9-2,2-2s2,0.9,2,2v12C80.5,90.6,79.6,91.5,78.5,91.5z" fill="#78909c"/></g></svg>
);

export default function ChatbotIcon({ onClick }) {
  return (
    <button className="chatbot-icon-button" onClick={onClick} aria-label="Open Chat">
      <div className="icon-container">
        <RobotIcon />
      </div>
      <div className="icon-shadow" />
    </button>
  );
}
