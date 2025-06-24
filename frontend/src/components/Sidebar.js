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
//   FaSun
// } from 'react-icons/fa';
// import './Sidebar.css';

// export default function Sidebar() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const [dark, setDark] = useState(false);
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

//   const show = roles => user && roles.includes(user.user_rank);

//   return (
//     <aside className={`sidebar ${dark ? 'dark' : 'light'}`}>
//       <header className="sidebar-header">
//         <h2 className="sidebar-title">
//           CSO
//           <br />
//           Rutgers
//         </h2>
//         <button
//           className="theme-toggle"
//           onClick={() => setDark(d => !d)}
//           aria-label="Toggle theme"
//         >
//           {dark ? <FaSun /> : <FaMoon />}
//         </button>
//       </header>

//       <nav className="sidebar-nav">
//         <NavLink to="/dashboard" className={linkClass}>
//           <FaHome /> Dashboard
//         </NavLink>

//         <NavLink to="/coverages" className={linkClass}>
//           <FaUserCheck /> Coverage Requests
//         </NavLink>

//         <NavLink to="/calendar" className={linkClass}>
//           <FaCalendar /> Calendar
//         </NavLink>

//         <NavLink to="/notifications" className={linkClass}>
//           <FaBell /> Notifications
//         </NavLink>

//         <NavLink to="/media-files" className={linkClass}>
//           <FaFile /> Media Files
//         </NavLink>

//         {/* FAQ link removed */}

//         <NavLink to="/hierarchy" className={linkClass}>
//           <FaSitemap /> Command Hierarchy
//         </NavLink>

//         <NavLink to="/events" className={linkClass}>
//           <FaCalendarAlt /> Special Events
//         </NavLink>

//         {show(EVENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/events" className={linkClass}>
//             <FaCalendarAlt /> Admin Events
//           </NavLink>
//         )}

//         {show(ADMIN_USER_ROLES) && (
//           <NavLink to="/admin/users" className={linkClass}>
//             <FaUsers /> User Management
//           </NavLink>
//         )}

//         <NavLink to="/announcements" className={linkClass}>
//           <FaBullhorn /> Announcements
//           {annCount > 0 && <span className="badge">{annCount}</span>}
//         </NavLink>

//         {show(ANNOUNCEMENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/announcements" className={linkClass}>
//             <FaBullhorn /> Manage Announcements
//           </NavLink>
//         )}

//         {show(SUPERVISOR_ROLES) && (
//           <NavLink to="/overview" className={linkClass}>
//             <FaChartBar /> Overview
//           </NavLink>
//         )}

//         {show(CSO_LEAVE_REQUESTER_ROLES) && (
//           <NavLink to="/cso/leave" className={linkClass}>
//             Request CSO Leave
//           </NavLink>
//         )}

//         {show(CSO_LEAVE_APPROVER_ROLES) && (
//           <NavLink to="/cso/leave/approve" className={linkClass}>
//             Approve CSO Leave
//           </NavLink>
//         )}

//         {show(CSO_MANDATE_ROLES) && (
//           <NavLink to="/cso/mandate" className={linkClass}>
//             Mandate CSO Shift
//           </NavLink>
//         )}

//         {user?.division === SECURITY_DIVISION &&
//           show(SECURITY_OFFICER_ROLES) && (
//             <NavLink to="/security/leave" className={linkClass}>
//               Request Security Leave
//             </NavLink>
//           )}

//         {user?.division === SECURITY_DIVISION &&
//           show(SECURITY_LEAVE_APPROVER_ROLES) && (
//             <NavLink to="/security/leave/approve" className={linkClass}>
//               Approve Security Leave
//             </NavLink>
//           )}
//       </nav>

//       <button onClick={onLogout} className="logout-btn">
//         Logout
//       </button>
//     </aside>
//   );
// }

//---------------------------------------------------------------------------
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
//   FaSun
// } from 'react-icons/fa';
// import './Sidebar.css';

// // The component only needs the `isOpen` prop now
// export default function Sidebar({ isOpen }) {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const [dark, setDark] = useState(false);
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

//   const show = roles => user && roles.includes(user.user_rank);

//   return (
//     <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
//       <header className="sidebar-header">
//         <h2 className="sidebar-title">
//           CSO
//           <br />
//           Rutgers
//         </h2>

//         {/* The toggle button is no longer here */}

//         <button
//           className="theme-toggle"
//           onClick={() => setDark(d => !d)}
//           aria-label="Toggle theme"
//         >
//           {dark ? <FaSun /> : <FaMoon />}
//         </button>
//       </header>

//       <nav className="sidebar-nav">
//         <NavLink to="/dashboard" className={linkClass}>
//           <FaHome /> Dashboard
//         </NavLink>
//         <NavLink to="/coverages" className={linkClass}>
//           <FaUserCheck /> Coverage Requests
//         </NavLink>
//         <NavLink to="/calendar" className={linkClass}>
//           <FaCalendar /> Calendar
//         </NavLink>
//         <NavLink to="/notifications" className={linkClass}>
//           <FaBell /> Notifications
//         </NavLink>
//         <NavLink to="/media-files" className={linkClass}>
//           <FaFile /> Media Files
//         </NavLink>
//         <NavLink to="/hierarchy" className={linkClass}>
//           <FaSitemap /> Command Hierarchy
//         </NavLink>
//         <NavLink to="/events" className={linkClass}>
//           <FaCalendarAlt /> Special Events
//         </NavLink>
//         {show(EVENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/events" className={linkClass}>
//             <FaCalendarAlt /> Admin Events
//           </NavLink>
//         )}
//         {show(ADMIN_USER_ROLES) && (
//           <NavLink to="/admin/users" className={linkClass}>
//             <FaUsers /> User Management
//           </NavLink>
//         )}
//         <NavLink to="/announcements" className={linkClass}>
//           <FaBullhorn /> Announcements
//           {annCount > 0 && <span className="badge">{annCount}</span>}
//         </NavLink>
//         {show(ANNOUNCEMENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/announcements" className={linkClass}>
//             <FaBullhorn /> Manage Announcements
//           </NavLink>
//         )}
//         {show(SUPERVISOR_ROLES) && (
//           <NavLink to="/overview" className={linkClass}>
//             <FaChartBar /> Overview
//           </NavLink>
//         )}
//         {show(CSO_LEAVE_REQUESTER_ROLES) && (
//           <NavLink to="/cso/leave" className={linkClass}>
//             Request CSO Leave
//           </NavLink>
//         )}
//         {show(CSO_LEAVE_APPROVER_ROLES) && (
//           <NavLink to="/cso/leave/approve" className={linkClass}>
//             Approve CSO Leave
//           </NavLink>
//         )}
//         {show(CSO_MANDATE_ROLES) && (
//           <NavLink to="/cso/mandate" className={linkClass}>
//             Mandate CSO Shift
//           </NavLink>
//         )}
//         {user?.division === SECURITY_DIVISION &&
//           show(SECURITY_OFFICER_ROLES) && (
//             <NavLink to="/security/leave" className={linkClass}>
//               Request Security Leave
//             </NavLink>
//           )}
//         {user?.division === SECURITY_DIVISION &&
//           show(SECURITY_LEAVE_APPROVER_ROLES) && (
//             <NavLink to="/security/leave/approve" className={linkClass}>
//               Approve Security Leave
//             </NavLink>
//           )}
//       </nav>

//       <button onClick={onLogout} className="logout-btn">
//         Logout
//       </button>
//     </aside>
//   );
// }

import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// --- THIS IS THE MAIN CHANGE ---
// We are now importing all exports from 'api.js' into a single 'api' object
import * as api from '../api';
// --- END CHANGE ---
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

export default function Sidebar({ isOpen }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(false);
  const [annCount, setAnnCount] = useState(0);

  useEffect(() => {
    // --- THIS IS THE OTHER CHANGE ---
    // We now call the function as a method of the 'api' object
    api.listAnnouncements()
      .then(list => setAnnCount(list.length))
      .catch(() => {});
  }, []);

  const onLogout = () => {
    logout();
    nav('/');
  };

  const linkClass = ({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`;
  const show = roles => user && roles.includes(user.user_rank);

  return (
    <aside className={`sidebar ${dark ? 'dark' : 'light'} ${isOpen ? 'open' : ''}`}>
      <header className="sidebar-header">
        <h2 className="sidebar-title">CSO Rutgers</h2>
        <button
          className="theme-toggle"
          onClick={() => setDark(d => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}><FaHome /> Dashboard</NavLink>
        <NavLink to="/coverages" className={linkClass}><FaUserCheck /> Coverage Requests</NavLink>
        <NavLink to="/calendar" className={linkClass}><FaCalendar /> Calendar</NavLink>
        <NavLink to="/notifications" className={linkClass}><FaBell /> Notifications</NavLink>
        <NavLink to="/media-files" className={linkClass}><FaFile /> Media Files</NavLink>
        <NavLink to="/hierarchy" className={linkClass}><FaSitemap /> Command Hierarchy</NavLink>
        <NavLink to="/events" className={linkClass}><FaCalendarAlt /> Special Events</NavLink>
        {show(EVENT_CREATOR_ROLES) && ( <NavLink to="/admin/events" className={linkClass}><FaCalendarAlt /> Admin Events</NavLink> )}
        {show(ADMIN_USER_ROLES) && ( <NavLink to="/admin/users" className={linkClass}><FaUsers /> User Management</NavLink> )}
        <NavLink to="/announcements" className={linkClass}> <FaBullhorn /> Announcements {annCount > 0 && <span className="badge">{annCount}</span>} </NavLink>
        {show(ANNOUNCEMENT_CREATOR_ROLES) && ( <NavLink to="/admin/announcements" className={linkClass}><FaBullhorn /> Manage Announcements</NavLink> )}
        {show(SUPERVISOR_ROLES) && ( <NavLink to="/overview" className={linkClass}><FaChartBar /> Overview</NavLink> )}
        {show(CSO_LEAVE_REQUESTER_ROLES) && ( <NavLink to="/cso/leave" className={linkClass}> Request CSO Leave</NavLink> )}
        {show(CSO_LEAVE_APPROVER_ROLES) && ( <NavLink to="/cso/leave/approve" className={linkClass}> Approve CSO Leave</NavLink> )}
        {show(CSO_MANDATE_ROLES) && ( <NavLink to="/cso/mandate" className={linkClass}> Mandate CSO Shift</NavLink> )}
        {user?.division === SECURITY_DIVISION && show(SECURITY_OFFICER_ROLES) && ( <NavLink to="/security/leave" className={linkClass}> Request Security Leave</NavLink> )}
        {user?.division === SECURITY_DIVISION && show(SECURITY_LEAVE_APPROVER_ROLES) && ( <NavLink to="/security/leave/approve" className={linkClass}> Approve Security Leave</NavLink> )}
      </nav>

      <button onClick={onLogout} className="logout-btn">
        Logout
      </button>
    </aside>
  );
}
