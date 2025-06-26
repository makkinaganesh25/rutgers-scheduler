// src/components/ChatbotIcon.js
import React, { useState, useEffect } from 'react';
import './ChatbotIcon.css';

// Import the new images
import normalBot from '../assets/bot-normal.png';
import knightBot from '../assets/bot-knight.png';

export default function ChatbotIcon({ onClick }) {
  // States: 'idle' -> 'spinning' -> 'transformed'
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    // This effect triggers the animation sequence once, when the component mounts.
    const spinTimer = setTimeout(() => {
      setPhase('spinning');
    }, 1000); // Wait 1 second before starting the transformation

    const transformedTimer = setTimeout(() => {
      setPhase('transformed');
    }, 2500); // The spin animation takes 1.5s, so we set the final state after it's done

    // Cleanup timers if the component is unmounted
    return () => {
      clearTimeout(spinTimer);
      clearTimeout(transformedTimer);
    };
  }, []); // Empty array ensures this runs only on mount

  return (
    <button
      className="chatbot-icon-button"
      onClick={onClick}
      aria-label="Open Chat"
    >
      <div className={`icon-flipper ${phase}`}>
        {/* The front of the icon (Normal Bot) */}
        <div className="icon-front">
          <img src={normalBot} alt="Chatbot" />
        </div>
        
        {/* The back of the icon (Knight Bot) */}
        <div className="icon-back">
          <img src={knightBot} alt="CSO Chatbot" />
        </div>
      </div>
      <div className="icon-shadow" />
    </button>
  );
}
