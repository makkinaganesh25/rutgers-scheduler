// src/components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendar, FaBell, FaFile, FaQuestionCircle } from 'react-icons/fa';
import './Sidebar.css';

function Sidebar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Clear the authentication token
        navigate('/'); // Redirect to the login page
    };

    return (
        <div className="sidebar">
            <h2 className="sidebar-title">CSO<br />Rutgers</h2>
            <nav>
                <NavLink to="/dashboard" activeClassName="active-link">
                    <FaHome /> Dashboard
                </NavLink>
                <NavLink to="/calendar" activeClassName="active-link">
                    <FaCalendar /> Calendar
                </NavLink>
                <NavLink to="/notifications" activeClassName="active-link">
                    <FaBell /> Notifications
                </NavLink>
                <NavLink to="/media-files" activeClassName="active-link">
                    <FaFile /> Media Files
                </NavLink>
                <NavLink to="/faq" activeClassName="active-link">
                    <FaQuestionCircle /> FAQ
                </NavLink>
            </nav>
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
}

export default Sidebar;


