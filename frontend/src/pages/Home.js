// src/pages/Home.js
import React from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import Chatbot from '../components/Chatbot';

function Home() {
    return (
        <div className="home-container">
            <Sidebar />
            <Dashboard />
            <Chatbot />
        </div>
    );
}

export default Home;
