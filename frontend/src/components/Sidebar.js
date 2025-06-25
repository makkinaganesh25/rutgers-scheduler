
// //-----------------------------------------------------------------------
// // src/components/Sidebar.jsx
// import React, { useState, useEffect } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// import { listAnnouncements } from '../api';
// import {
//   SUPERVISOR_ROLES,
//   EVENT_CREATOR_ROLES,
//   ADMIN_USER_ROLES,
//   ANNOUNCEMENT_CREATOR_ROLES,
//   CSO_LEAVE_REQUESTER_ROLES,
//   CSO_LEAVE_APPROVER_ROLES,
//   CSO_MANDATE_ROLES,
//   SECURITY_DIVISION,
//   SECURITY_OFFICER_ROLES,
//   SECURITY_LEAVE_APPROVER_ROLES
// } from '../config/roles';
// import {
//   FaHome,
//   FaUserCheck,
//   FaCalendar,
//   FaBell,
//   FaFile,
//   FaCalendarAlt,
//   FaChartBar,
//   FaSitemap,
//   FaUsers,
//   FaBullhorn,
//   FaMoon,
//   FaSun,
// } from 'react-icons/fa';
// import './Sidebar.css';

// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   // --- CHANGE 1: Set default state to true for dark mode ---
//   const [dark, setDark] = useState(true);
//   const [annCount, setAnnCount] = useState(0);

//   useEffect(() => {
//     // This is a good place to eventually sync with localStorage if you want
//     // to persist the user's theme choice across sessions.
//     listAnnouncements()
//       .then(list => setAnnCount(list.length))
//       .catch(() => {});
//   }, []);

//   const onLogout = () => {
//     logout();
//     nav('/');
//   };

//   const linkClass = ({ isActive }) =>
//     `sidebar-link${isActive ? ' active' : ''}`;

//   const handleLinkClick = () => {
//       if (isOpen && window.innerWidth < 768) {
//         toggleSidebar();
//       }
//   }

//   const show = roles => user && roles.includes(user.user_rank);

//   return (
//     <>
//       <div 
//         className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
//         onClick={toggleSidebar}
//       ></div>

//       <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
//         <div className="sidebar-handle"></div>
        
//         {/* --- CHANGE 2: Added a spacer for centering --- */}
//         <header className="sidebar-header">
//           <span /> {/* This empty span is a spacer */}
//           <h2 className="sidebar-title">
//             CSO
//             <br />
//             Rutgers
//           </h2>
//           <button
//             className="theme-toggle"
//             onClick={() => setDark(d => !d)}
//             aria-label="Toggle theme"
//           >
//             {dark ? <FaSun /> : <FaMoon />}
//           </button>
//         </header>

//         <nav className="sidebar-nav" onClick={handleLinkClick}>
//             <NavLink to="/dashboard" className={linkClass}>
//                 <FaHome /> Dashboard
//             </NavLink>
//             <NavLink to="/coverages" className={linkClass}>
//                 <FaUserCheck /> Coverage Requests
//             </NavLink>
//             <NavLink to="/calendar" className={linkClass}>
//                 <FaCalendar /> Calendar
//             </NavLink>
//             <NavLink to="/notifications" className={linkClass}>
//                 <FaBell /> Notifications
//             </NavLink>
//             <NavLink to="/media-files" className={linkClass}>
//                 <FaFile /> Media Files
//             </NavLink>
//             <NavLink to="/hierarchy" className={linkClass}>
//                 <FaSitemap /> Command Hierarchy
//             </NavLink>
//             <NavLink to="/events" className={linkClass}>
//                 <FaCalendarAlt /> Special Events
//             </NavLink>
//             {show(EVENT_CREATOR_ROLES) && (
//                 <NavLink to="/admin/events" className={linkClass}>
//                 <FaCalendarAlt /> Admin Events
//                 </NavLink>
//             )}
//             {show(ADMIN_USER_ROLES) && (
//                 <NavLink to="/admin/users" className={linkClass}>
//                 <FaUsers /> User Management
//                 </NavLink>
//             )}
//             <NavLink to="/announcements" className={linkClass}>
//                 <FaBullhorn /> Announcements
//                 {annCount > 0 && <span className="badge">{annCount}</span>}
//             </NavLink>
//             {show(ANNOUNCEMENT_CREATOR_ROLES) && (
//                 <NavLink to="/admin/announcements" className={linkClass}>
//                 <FaBullhorn /> Manage Announcements
//                 </NavLink>
//             )}
//             {show(SUPERVISOR_ROLES) && (
//                 <NavLink to="/overview" className={linkClass}>
//                 <FaChartBar /> Overview
//                 </NavLink>
//             )}
//             {show(CSO_LEAVE_REQUESTER_ROLES) && (
//                 <NavLink to="/cso/leave" className={linkClass}>
//                 Request CSO Leave
//                 </NavLink>
//             )}
//             {show(CSO_LEAVE_APPROVER_ROLES) && (
//                 <NavLink to="/cso/leave/approve" className={linkClass}>
//                 Approve CSO Leave
//                 </NavLink>
//             )}
//             {show(CSO_MANDATE_ROLES) && (
//                 <NavLink to="/cso/mandate" className={linkClass}>
//                 Mandate CSO Shift
//                 </NavLink>
//             )}
//             {user?.division === SECURITY_DIVISION &&
//                 show(SECURITY_OFFICER_ROLES) && (
//                 <NavLink to="/security/leave" className={linkClass}>
//                     Request Security Leave
//                 </NavLink>
//                 )}
//             {user?.division === SECURITY_DIVISION &&
//                 show(SECURITY_LEAVE_APPROVER_ROLES) && (
//                 <NavLink to="/security/leave/approve" className={linkClass}>
//                     Approve Security Leave
//                 </NavLink>
//                 )}
//         </nav>
        
//         <button onClick={onLogout} className="logout-btn">
//           Logout
//         </button>
//       </aside>
//     </>
//   );
// }

// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { listAnnouncements } from '../api';
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
  FaSun,
  FaLayerGroup  // Icon for permanent shifts
} from 'react-icons/fa';
import './Sidebar.css';

// Assuming this role constant would be defined in your config/roles.js
const PERMANENT_SHIFT_ROLES = ADMIN_USER_ROLES;

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  // --- default dark mode to true ---
  const [dark, setDark] = useState(true);
  const [annCount, setAnnCount] = useState(0);

  useEffect(() => {
    listAnnouncements()
      .then(list => setAnnCount(list.length))
      .catch(() => {});
  }, []);

  const onLogout = () => {
    logout();
    nav('/');
  };

  const linkClass = ({ isActive }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  const handleLinkClick = () => {
    if (isOpen && window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const show = roles => user && roles.includes(user.user_rank);

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      ></div>

      <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-handle"></div>

        <header className="sidebar-header">
          <span /> {/* spacer */}
          <h2 className="sidebar-title">
            CSO
            <br />
            Rutgers
          </h2>
          <button
            className="theme-toggle"
            onClick={() => setDark(d => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <FaSun /> : <FaMoon />}
          </button>
        </header>

        <nav className="sidebar-nav" onClick={handleLinkClick}>
          <NavLink to="/dashboard" className={linkClass}>
            <FaHome /> Dashboard
          </NavLink>
          <NavLink to="/coverages" className={linkClass}>
            <FaUserCheck /> Coverage Requests
          </NavLink>
          <NavLink to="/calendar" className={linkClass}>
            <FaCalendar /> Calendar
          </NavLink>
          <NavLink to="/notifications" className={linkClass}>
            <FaBell /> Notifications
          </NavLink>
          <NavLink to="/media-files" className={linkClass}>
            <FaFile /> Media Files
          </NavLink>
          <NavLink to="/hierarchy" className={linkClass}>
            <FaSitemap /> Command Hierarchy
          </NavLink>
          <NavLink to="/events" className={linkClass}>
            <FaCalendarAlt /> Special Events
          </NavLink>

          {show(EVENT_CREATOR_ROLES) && (
            <NavLink to="/admin/events" className={linkClass}>
              <FaCalendarAlt /> Admin Events
            </NavLink>
          )}

          {/* Permanent Shifts link */}
          {show(PERMANENT_SHIFT_ROLES) && (
            <NavLink to="/admin/permanent-shifts" className={linkClass}>
              <FaLayerGroup /> Manage Permanent Shifts
            </NavLink>
          )}

          {show(ADMIN_USER_ROLES) && (
            <NavLink to="/admin/users" className={linkClass}>
              <FaUsers /> User Management
            </NavLink>
          )}

          <NavLink to="/announcements" className={linkClass}>
            <FaBullhorn /> Announcements
            {annCount > 0 && <span className="badge">{annCount}</span>}
          </NavLink>
          {show(ANNOUNCEMENT_CREATOR_ROLES) && (
            <NavLink to="/admin/announcements" className={linkClass}>
              <FaBullhorn /> Manage Announcements
            </NavLink>
          )}
          {show(SUPERVISOR_ROLES) && (
            <NavLink to="/overview" className={linkClass}>
              <FaChartBar /> Overview
            </NavLink>
          )}
          {show(CSO_LEAVE_REQUESTER_ROLES) && (
            <NavLink to="/cso/leave" className={linkClass}>
              Request CSO Leave
            </NavLink>
          )}
          {show(CSO_LEAVE_APPROVER_ROLES) && (
            <NavLink to="/cso/leave/approve" className={linkClass}>
              Approve CSO Leave
            </NavLink>
          )}
          {show(CSO_MANDATE_ROLES) && (
            <NavLink to="/cso/mandate" className={linkClass}>
              Mandate CSO Shift
            </NavLink>
          )}
          {user?.division === SECURITY_DIVISION &&
            show(SECURITY_OFFICER_ROLES) && (
              <NavLink to="/security/leave" className={linkClass}>
                Request Security Leave
              </NavLink>
            )}
          {user?.division === SECURITY_DIVISION &&
            show(SECURITY_LEAVE_APPROVER_ROLES) && (
              <NavLink to="/security/leave/approve" className={linkClass}>
                Approve Security Leave
              </NavLink>
            )}
        </nav>

        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </aside>
    </>
  );
}
