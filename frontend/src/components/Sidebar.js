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
//   FaLayerGroup  // Icon for permanent shifts
// } from 'react-icons/fa';
// import './Sidebar.css';

// // Assuming this role constant would be defined in your config/roles.js
// const PERMANENT_SHIFT_ROLES = ADMIN_USER_ROLES;

// export default function Sidebar({ isOpen, toggleSidebar }) {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   // --- default dark mode to true ---
//   const [dark, setDark] = useState(true);
//   const [annCount, setAnnCount] = useState(0);

//   useEffect(() => {
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
//     if (isOpen && window.innerWidth < 768) {
//       toggleSidebar();
//     }
//   };

//   const show = roles => user && roles.includes(user.user_rank);

//   return (
//     <>
//       <div
//         className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
//         onClick={toggleSidebar}
//       ></div>

//       <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
//         <div className="sidebar-handle"></div>

//         <header className="sidebar-header">
//           <span /> {/* spacer */}
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
//           <NavLink to="/dashboard" className={linkClass}>
//             <FaHome /> Dashboard
//           </NavLink>
//           <NavLink to="/coverages" className={linkClass}>
//             <FaUserCheck /> Coverage Requests
//           </NavLink>
//           <NavLink to="/calendar" className={linkClass}>
//             <FaCalendar /> Calendar
//           </NavLink>
//           <NavLink to="/notifications" className={linkClass}>
//             <FaBell /> Notifications
//           </NavLink>
//           <NavLink to="/media-files" className={linkClass}>
//             <FaFile /> Media Files
//           </NavLink>
//           <NavLink to="/hierarchy" className={linkClass}>
//             <FaSitemap /> Command Hierarchy
//           </NavLink>
//           <NavLink to="/events" className={linkClass}>
//             <FaCalendarAlt /> Special Events
//           </NavLink>

//           {show(EVENT_CREATOR_ROLES) && (
//             <NavLink to="/admin/events" className={linkClass}>
//               <FaCalendarAlt /> Admin Events
//             </NavLink>
//           )}

//           {/* Permanent Shifts link */}
//           {show(PERMANENT_SHIFT_ROLES) && (
//             <NavLink to="/admin/permanent-shifts" className={linkClass}>
//               <FaLayerGroup /> Manage Permanent Shifts
//             </NavLink>
//           )}

//           {show(ADMIN_USER_ROLES) && (
//             <NavLink to="/admin/users" className={linkClass}>
//               <FaUsers /> User Management
//             </NavLink>
//           )}

//           <NavLink to="/announcements" className={linkClass}>
//             <FaBullhorn /> Announcements
//             {annCount > 0 && <span className="badge">{annCount}</span>}
//           </NavLink>
//           {show(ANNOUNCEMENT_CREATOR_ROLES) && (
//             <NavLink to="/admin/announcements" className={linkClass}>
//               <FaBullhorn /> Manage Announcements
//             </NavLink>
//           )}
//           {show(SUPERVISOR_ROLES) && (
//             <NavLink to="/overview" className={linkClass}>
//               <FaChartBar /> Overview
//             </NavLink>
//           )}
//           {show(CSO_LEAVE_REQUESTER_ROLES) && (
//             <NavLink to="/cso/leave" className={linkClass}>
//               Request CSO Leave
//             </NavLink>
//           )}
//           {show(CSO_LEAVE_APPROVER_ROLES) && (
//             <NavLink to="/cso/leave/approve" className={linkClass}>
//               Approve CSO Leave
//             </NavLink>
//           )}
//           {show(CSO_MANDATE_ROLES) && (
//             <NavLink to="/cso/mandate" className={linkClass}>
//               Mandate CSO Shift
//             </NavLink>
//           )}
//           {user?.division === SECURITY_DIVISION &&
//             show(SECURITY_OFFICER_ROLES) && (
//               <NavLink to="/security/leave" className={linkClass}>
//                 Request Security Leave
//               </NavLink>
//             )}
//           {user?.division === SECURITY_DIVISION &&
//             show(SECURITY_LEAVE_APPROVER_ROLES) && (
//               <NavLink to="/security/leave/approve" className={linkClass}>
//                 Approve Security Leave
//               </NavLink>
//             )}
//         </nav>

//         <button onClick={onLogout} className="logout-btn">
//           Logout
//         </button>
//       </aside>
//     </>
//   );
// }

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
  FaLayerGroup,
  FaSignOutAlt // Added for logout button
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
          {/* UPDATED: New container for logo and title */}
          <div className="logo-title">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h2 className="sidebar-title">Shiftelix</h2>
          </div>
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
          <FaSignOutAlt/>
          <span style={{marginLeft: '8px'}}>Logout</span>
        </button>
      </aside>
    </>
  );
}
