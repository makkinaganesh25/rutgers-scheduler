import React, { useState } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [responses, setResponses] = useState([]);

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const sendQuery = async () => {
        if (!query) return;

        const response = await fetch('http://localhost:5500/api/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        const data = await response.json();

        // Update the responses state to include the new responses from the server
        setResponses([...responses, { query, responses: data.responses }]);
        setQuery('');
    };

    return (
        <div className="chatbot-wrapper">
            <button className="chatbot-toggle" onClick={toggleChatbot}>
                {isOpen ? '✕' : '💬'}
            </button>

            {isOpen && (
                <div className="chatbot-container">
                    <div className="chat-display">
                        {responses.map((item, index) => (
                            <div key={index} className="chat-message">
                                <p><strong>You:</strong> {item.query}</p>
                                {item.responses && item.responses.map((res, idx) => (
                                    <p key={idx}><strong>Bot:</strong> {res.snippet}</p>
                                ))}
                            </div>
                        ))}
                    </div>
                    <div className="chat-input">
                        <textarea
                            placeholder="Ask a question..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button onClick={sendQuery}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;