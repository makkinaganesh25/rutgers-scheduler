// // src/components/Chatbot.js
// import React, { useState } from 'react';
// import ChatWindow from './ChatWindow';
// import './Chatbot.css';

// export default function Chatbot() {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="chatbot-container">
//       {open && <ChatWindow onClose={() => setOpen(false)} />}
//       <button
//         className="chat-toggle-btn"
//         onClick={() => setOpen(o => !o)}
//         aria-label={open ? 'Close chat' : 'Open chat'}
//       >
//         {open ? '×' : '💬'}
//       </button>
//     </div>
//   );
// }

// src/components/Chatbot.js
import React, { useState } from 'react';
import ChatWindow from './ChatWindow';
import ChatbotIcon from './ChatbotIcon';
import './Chatbot.css'; // <-- Import the new CSS

export default function Chatbot() {
  const [isChatOpen, setChatOpen] = useState(false);

  const toggleChat = () => {
    setChatOpen(prev => !prev);
  };

  return (
    <div>
      {isChatOpen ? (
        <div className="chatbot-window-container">
          <ChatWindow onClose={toggleChat} />
        </div>
      ) : (
        <ChatbotIcon onClick={toggleChat} />
      )}
    </div>
  );
}
