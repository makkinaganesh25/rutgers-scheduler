// src/pages/Dashboard.js
import React from 'react';
import './Dashboard.css';

function Dashboard() {
    return (
        <div className="dashboard">
            <h1 className="dashboard-title">Dashboard</h1>
            <div className="dashboard-content">
                <div className="section">
                    <h2>Today</h2>
                    <p>Nothing Planned Yet</p>
                </div>
                <div className="section">
                    <h2>Tomorrow</h2>
                    <p>Nothing Planned Yet</p>
                </div>
                <div className="section">
                    <h2>Upcoming</h2>
                    <p>November 9 to November 11</p>
                    <p>Nothing Planned Yet</p>
                </div>
                <div className="section upcoming-events">
                    <h2>Events and Assignments</h2>
                    <div className="event">
                        <h3>Project Declaration</h3>
                        <p>Due: November 12, 11:59 PM</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
