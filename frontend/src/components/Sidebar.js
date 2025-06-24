import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  SUPERVISOR_ROLES,
  EVENT_CREATOR_ROLES,
  ADMIN_USER_ROLES,
  ANNOUNCEMENT_CREATOR_ROLES,
  CSO_LEAVE_REQUESTER_ROLES,
  CSO_LEAVE_APPROVER_ROLES,
  CSO_MANDATE_ROLES,
  SECURITY_DIVISION,
  SECURITY_OFFICER_ROLES,
  SECURITY_LEAVE_APPROVER_ROLES
} from '../config/roles';
import {
  FaHome,
  FaUserCheck,
  FaCalendar,
  FaBell,
  FaFile,
  FaCalendarAlt,
  FaChartBar,
  FaSitemap,
  FaUsers,
  FaBullhorn,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import './Sidebar.css';

// The sidebar is now simpler. It just needs to know if it's open and how to close itself when a link is clicked.
export default function Sidebar({ isOpen, closeSidebar }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(false);

  const onLogout = () => {
    logout();
    nav('/');
  };

  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;
  const show = roles => user && roles.includes(user.user_rank);

  // When a NavLink is clicked, it will now also call the closeSidebar function
  const handleLinkClick = () => {
    if (isOpen) {
        closeSidebar();
    }
  }

  return (
    <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
      <header className="sidebar-header">
        {/* The hamburger button is no longer here */}
        <h2 className="sidebar-title">CSO Rutgers</h2>
        <button
          className="theme-toggle"
          onClick={() => setDark(d => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      {/* When a link inside the nav is clicked, the entire nav's onClick is triggered */}
      <nav className="sidebar-nav" onClick={handleLinkClick}>
        <NavLink to="/dashboard" className={linkClass}><FaHome /> Dashboard</NavLink>
        <NavLink to="/coverages" className={linkClass}><FaUserCheck /> Coverage Requests</NavLink>
        <NavLink to="/calendar" className={linkClass}><FaCalendar /> Calendar</NavLink>
        <NavLink to="/notifications" className={linkClass}><FaBell /> Notifications</NavLink>
        <NavLink to="/media-files" className={linkClass}><FaFile /> Media Files</NavLink>
        <NavLink to="/hierarchy" className={linkClass}><FaSitemap /> Command Hierarchy</NavLink>
        <NavLink to="/events" className={linkClass}><FaCalendarAlt /> Special Events</NavLink>
        {show(EVENT_CREATOR_ROLES) && ( <NavLink to="/admin/events" className={linkClass}><FaCalendarAlt /> Admin Events</NavLink> )}
        {show(ADMIN_USER_ROLES) && ( <NavLink to="/admin/users" className={linkClass}><FaUsers /> User Management</NavLink> )}
        <NavLink to="/announcements" className={linkClass}><FaBullhorn /> Announcements</NavLink>
        {show(ANNOUNCEMENT_CREATOR_ROLES) && ( <NavLink to="/admin/announcements" className={linkClass}><FaBullhorn /> Manage Announcements</NavLink> )}
        {show(SUPERVISOR_ROLES) && ( <NavLink to="/overview" className={linkClass}><FaChartBar /> Overview</NavLink> )}
        {show(CSO_LEAVE_REQUESTER_ROLES) && ( <NavLink to="/cso/leave" className={linkClass}>Request CSO Leave</NavLink> )}
        {show(CSO_LEAVE_APPROVER_ROLES) && ( <NavLink to="/cso/leave/approve" className={linkClass}>Approve CSO Leave</NavLink> )}
        {show(CSO_MANDATE_ROLES) && ( <NavLink to="/cso/mandate" className={linkClass}>Mandate CSO Shift</NavLink> )}
        {user?.division === SECURITY_DIVISION && show(SECURITY_OFFICER_ROLES) && ( <NavLink to="/security/leave" className={linkClass}>Request Security Leave</NavLink> )}
        {user?.division === SECURITY_DIVISION && show(SECURITY_LEAVE_APPROVER_ROLES) && ( <NavLink to="/security/leave/approve" className={linkClass}>Approve Security Leave</NavLink> )}
      </nav>

      <button onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  );
}
