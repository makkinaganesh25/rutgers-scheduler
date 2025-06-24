import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  FaHome, FaUserCheck, FaCalendar, FaBell, FaFile, FaCalendarAlt, FaChartBar,
  FaSitemap, FaUsers, FaBullhorn, FaMoon, FaSun, FaAngleLeft, FaAngleRight
} from 'react-icons/fa';
import {
  SUPERVISOR_ROLES, EVENT_CREATOR_ROLES, ADMIN_USER_ROLES, ANNOUNCEMENT_CREATOR_ROLES,
  CSO_LEAVE_REQUESTER_ROLES, CSO_LEAVE_APPROVER_ROLES, CSO_MANDATE_ROLES,
  SECURITY_DIVISION, SECURITY_OFFICER_ROLES, SECURITY_LEAVE_APPROVER_ROLES
} from '../config/roles';
import './Sidebar.css';

// The sidebar now receives a toggle function for the collapse button
export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(false);

  const onLogout = () => {
    logout();
    nav('/');
  };

  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;
  const show = roles => user && roles.includes(user.user_rank);

  return (
    <aside className="sidebar">
      <header className="sidebar-header">
        <div className="logo-area">
          <img src="/rutgers-logo.png" alt="Rutgers Logo" className="logo-img" />
          <h2 className="sidebar-title">CSO Rutgers</h2>
        </div>
        <button className="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          {isOpen ? <FaAngleLeft /> : <FaAngleRight />}
        </button>
      </header>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}><FaHome className="link-icon" /> <span className="link-text">Dashboard</span></NavLink>
        <NavLink to="/coverages" className={linkClass}><FaUserCheck className="link-icon" /> <span className="link-text">Coverage Requests</span></NavLink>
        <NavLink to="/calendar" className={linkClass}><FaCalendar className="link-icon" /> <span className="link-text">Calendar</span></NavLink>
        <NavLink to="/notifications" className={linkClass}><FaBell className="link-icon" /> <span className="link-text">Notifications</span></NavLink>
        <NavLink to="/media-files" className={linkClass}><FaFile className="link-icon" /> <span className="link-text">Media Files</span></NavLink>
        <NavLink to="/hierarchy" className={linkClass}><FaSitemap className="link-icon" /> <span className="link-text">Command Hierarchy</span></NavLink>
        <NavLink to="/events" className={linkClass}><FaCalendarAlt className="link-icon" /> <span className="link-text">Special Events</span></NavLink>
        {show(EVENT_CREATOR_ROLES) && (<NavLink to="/admin/events" className={linkClass}><FaCalendarAlt className="link-icon" /> <span className="link-text">Admin Events</span></NavLink>)}
        {show(ADMIN_USER_ROLES) && (<NavLink to="/admin/users" className={linkClass}><FaUsers className="link-icon" /> <span className="link-text">User Management</span></NavLink>)}
        <NavLink to="/announcements" className={linkClass}><FaBullhorn className="link-icon" /> <span className="link-text">Announcements</span></NavLink>
        {show(ANNOUNCEMENT_CREATOR_ROLES) && (<NavLink to="/admin/announcements" className={linkClass}><FaBullhorn className="link-icon" /> <span className="link-text">Manage Announcements</span></NavLink>)}
        {show(SUPERVISOR_ROLES) && (<NavLink to="/overview" className={linkClass}><FaChartBar className="link-icon" /> <span className="link-text">Overview</span></NavLink>)}
        {show(CSO_LEAVE_REQUESTER_ROLES) && (<NavLink to="/cso/leave" className={linkClass}><span className="link-text">Request CSO Leave</span></NavLink>)}
        {show(CSO_LEAVE_APPROVER_ROLES) && (<NavLink to="/cso/leave/approve" className={linkClass}><span className="link-text">Approve CSO Leave</span></NavLink>)}
        {show(CSO_MANDATE_ROLES) && (<NavLink to="/cso/mandate" className={linkClass}><span className="link-text">Mandate CSO Shift</span></NavLink>)}
        {user?.division === SECURITY_DIVISION && show(SECURITY_OFFICER_ROLES) && (<NavLink to="/security/leave" className={linkClass}><span className="link-text">Request Security Leave</span></NavLink>)}
        {user?.division === SECURITY_DIVISION && show(SECURITY_LEAVE_APPROVER_ROLES) && (<NavLink to="/security/leave/approve" className={linkClass}><span className="link-text">Approve Security Leave</span></NavLink>)}
      </nav>

      <div className="sidebar-footer">
        <button className="theme-toggle" onClick={() => setDark(d => !d)}>
            {dark ? <FaSun /> : <FaMoon />}
        </button>
        <button onClick={onLogout} className="logout-btn">
          <span className="link-text">Logout</span>
        </button>
      </div>
    </aside>
  );
}
