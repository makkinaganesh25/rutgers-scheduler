// src/components/Dashboard.js
import React from 'react';
import './Dashboard.css';

function Dashboard() {
    return (
        <div className="dashboard">
            <div className="profile-section">
                <h2>Welcome, [User]</h2>
                <p>Overview of your shifts and activity</p>
            </div>
            <div className="calendar-section">
                <h3>Calendar</h3>
                {/* Placeholder for Calendar */}
                <div className="calendar-placeholder">Calendar will be displayed here</div>
            </div>
            <div className="notifications-section">
                <h3>Notifications</h3>
                <p>All important messages and coverage requests will appear here.</p>
            </div>
            <div className="media-files-section">
                <h3>Media Files</h3>
                <p>Access binders and documents here.</p>
            </div>
            <div className="faq-section">
                <h3>FAQ</h3>
                <p>Find answers to frequently asked questions.</p>
            </div>
        </div>
    );
}

export default Dashboard;
