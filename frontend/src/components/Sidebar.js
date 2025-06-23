//---------------------------------------------------------------------------
// import React from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// import {
//   SUPERVISOR_ROLES,
//   EVENT_CREATOR_ROLES,
//   ADMIN_USER_ROLES,
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
//   FaQuestionCircle,
//   FaCalendarAlt,
//   FaChartBar,
//   FaSitemap,
//   FaUsers
// } from 'react-icons/fa';

// import './Sidebar.css';

// export default function Sidebar() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();

//   const showAdminEvents = user && EVENT_CREATOR_ROLES.includes(user.user_rank);
//   const showOverview    = user && SUPERVISOR_ROLES.includes(user.user_rank);
//   const showUserMgmt    = user && ADMIN_USER_ROLES.includes(user.user_rank);

//   const onLogout = () => {
//     logout();
//     nav('/');
//   };

//   const linkClass = ({ isActive }) => isActive ? 'active-link' : '';

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-title">CSO<br/>Rutgers</h2>
//       <nav>
//         <NavLink to="/dashboard"     end className={linkClass}><FaHome/> Dashboard</NavLink>
//         <NavLink to="/coverages"     end className={linkClass}><FaUserCheck/> Coverage Requests</NavLink>
//         <NavLink to="/calendar"      end className={linkClass}><FaCalendar/> Calendar</NavLink>
//         <NavLink to="/notifications" end className={linkClass}><FaBell/> Notifications</NavLink>
//         <NavLink to="/media-files"   end className={linkClass}><FaFile/> Media Files</NavLink>
//         <NavLink to="/faq"           end className={linkClass}><FaQuestionCircle/> FAQ</NavLink>
//         <NavLink to="/hierarchy"     end className={linkClass}><FaSitemap/> Command Hierarchy</NavLink>
//         <NavLink to="/events"        end className={linkClass}><FaCalendarAlt/> Special Events</NavLink>

//         {showAdminEvents && (
//           <NavLink to="/admin/events" end className={linkClass}>
//             <FaCalendarAlt/> Admin Events
//           </NavLink>
//         )}

//         {showUserMgmt && (
//           <NavLink to="/admin/users" end className={linkClass}>
//             <FaUsers/> User Management
//           </NavLink>
//         )}

//         {showOverview && (
//           <NavLink to="/overview" end className={linkClass}>
//             <FaChartBar/> Overview
//           </NavLink>
//         )}

//         {/* CSO Leave */}
//         {user && CSO_LEAVE_REQUESTER_ROLES.includes(user.user_rank) && (
//           <NavLink to="/cso/leave" end className={linkClass}>
//             Request CSO Leave
//           </NavLink>
//         )}
//         {user && CSO_LEAVE_APPROVER_ROLES.includes(user.user_rank) && (
//           <NavLink to="/cso/leave/approve" end className={linkClass}>
//             Approve CSO Leave
//           </NavLink>
//         )}
//         {user && CSO_MANDATE_ROLES.includes(user.user_rank) && (
//           <NavLink to="/cso/mandate" end className={linkClass}>
//             Mandate CSO Shift
//           </NavLink>
//         )}

//         {/* Security Leave */}
//         {user &&
//          user.division === SECURITY_DIVISION &&
//          SECURITY_OFFICER_ROLES.includes(user.user_rank) && (
//           <NavLink to="/security/leave" end className={linkClass}>
//             Request Security Leave
//           </NavLink>
//         )}
//         {user &&
//          user.division === SECURITY_DIVISION &&
//          SECURITY_LEAVE_APPROVER_ROLES.includes(user.user_rank) && (
//           <NavLink to="/security/leave/approve" end className={linkClass}>
//             Approve Security Leave
//           </NavLink>
//         )}
//       </nav>

//       <button onClick={onLogout} className="logout-button">
//         Logout
//       </button>
//     </div>
//   );
// }

//-----------------------------------------
// import React, { useState } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';    // optional
// import { useAuth } from '../contexts/AuthContext';
// import {
//   SUPERVISOR_ROLES,
//   EVENT_CREATOR_ROLES,
//   ADMIN_USER_ROLES,
//   CSO_LEAVE_REQUESTER_ROLES,
//   CSO_LEAVE_APPROVER_ROLES,
//   CSO_MANDATE_ROLES,
//   SECURITY_DIVISION,
//   SECURITY_OFFICER_ROLES,
//   SECURITY_LEAVE_APPROVER_ROLES
// } from '../config/roles';
// import {
//   FaHome, FaUserCheck, FaCalendar, FaBell, FaFile,
//   FaQuestionCircle, FaCalendarAlt, FaChartBar,
//   FaSitemap, FaUsers, FaMoon, FaSun
// } from 'react-icons/fa';
// import './Sidebar.css';

// export default function Sidebar() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const [dark, setDark] = useState(false);

//   const onLogout = () => {
//     logout();
//     nav('/');
//   };

//   const linkClass = ({ isActive }) =>
//     `sidebar-link${isActive ? ' active' : ''}`;

//   const show = roleArray => user && roleArray.includes(user.user_rank);

//   return (
//     <motion.aside
//       className={`sidebar ${dark ? 'dark' : 'light'}`}
//       initial={{ x: -300 }}
//       animate={{ x: 0 }}
//       transition={{ type: 'spring', stiffness: 120, damping: 20 }}
//     >
//       <header className="sidebar-header">
//         <h2 className="sidebar-title">CSO<br/>Rutgers</h2>
//         <button
//           className="theme-toggle"
//           onClick={() => setDark(d => !d)}
//           aria-label="Toggle sidebar theme"
//         >
//           {dark ? <FaSun/> : <FaMoon/>}
//         </button>
//       </header>
//       <nav className="sidebar-nav">
//         <NavLink to="/dashboard"     end className={linkClass}><FaHome/> Dashboard</NavLink>
//         <NavLink to="/coverages"     end className={linkClass}><FaUserCheck/> Coverage Requests</NavLink>
//         <NavLink to="/calendar"      end className={linkClass}><FaCalendar/> Calendar</NavLink>
//         <NavLink to="/notifications" end className={linkClass}><FaBell/> Notifications</NavLink>
//         <NavLink to="/media-files"   end className={linkClass}><FaFile/> Media Files</NavLink>
//         <NavLink to="/faq"           end className={linkClass}><FaQuestionCircle/> FAQ</NavLink>
//         <NavLink to="/hierarchy"     end className={linkClass}><FaSitemap/> Command Hierarchy</NavLink>
//         <NavLink to="/events"        end className={linkClass}><FaCalendarAlt/> Special Events</NavLink>

//         {show(EVENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/events" end className={linkClass}>
//             <FaCalendarAlt/> Admin Events
//           </NavLink>
//         )}
//         {show(ADMIN_USER_ROLES) && (
//           <NavLink to="/admin/users" end className={linkClass}>
//             <FaUsers/> User Management
//           </NavLink>
//         )}
//         {show(SUPERVISOR_ROLES) && (
//           <NavLink to="/overview" end className={linkClass}>
//             <FaChartBar/> Overview
//           </NavLink>
//         )}
//         {/* CSO Leave */}
//         {show(CSO_LEAVE_REQUESTER_ROLES) && (
//           <NavLink to="/cso/leave" end className={linkClass}>Request CSO Leave</NavLink>
//         )}
//         {show(CSO_LEAVE_APPROVER_ROLES) && (
//           <NavLink to="/cso/leave/approve" end className={linkClass}>Approve CSO Leave</NavLink>
//         )}
//         {show(CSO_MANDATE_ROLES) && (
//           <NavLink to="/cso/mandate" end className={linkClass}>Mandate CSO Shift</NavLink>
//         )}
//         {/* Security Leave */}
//         {user?.division === SECURITY_DIVISION &&
//          show(SECURITY_OFFICER_ROLES) && (
//           <NavLink to="/security/leave" end className={linkClass}>Request Security Leave</NavLink>
//         )}
//         {user?.division === SECURITY_DIVISION &&
//          show(SECURITY_LEAVE_APPROVER_ROLES) && (
//           <NavLink to="/security/leave/approve" end className={linkClass}>Approve Security Leave</NavLink>
//         )}
//       </nav>
//       <button onClick={onLogout} className="logout-btn">Logout</button>
//     </motion.aside>
//   );
// }

//-------------------------------------------------------------------------------------------
// // src/components/Sidebar.js
// import React, { useState, useEffect } from 'react';
// import { NavLink, useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
// // import { getAnnouncements } from '../api';
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
//   FaQuestionCircle,
//   FaCalendarAlt,
//   FaChartBar,
//   FaSitemap,
//   FaUsers,
//   FaBullhorn
// } from 'react-icons/fa';
// import './Sidebar.css';

// export default function Sidebar() {
//   const { user, logout } = useAuth();
//   const nav = useNavigate();
//   const [annCount, setAnnCount] = useState(0);

//   // fetch announcements count on mount
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
//     isActive ? 'active-link' : '';

//   const show = roles => user && roles.includes(user.user_rank);

//   return (
//     <div className="sidebar">
//       <h2 className="sidebar-title">CSO<br/>Rutgers</h2>
//       <nav>
//         <NavLink to="/dashboard" className={linkClass}>
//           <FaHome/> Dashboard
//         </NavLink>
//         <NavLink to="/coverages" className={linkClass}>
//           <FaUserCheck/> Coverage Requests
//         </NavLink>
//         <NavLink to="/calendar" className={linkClass}>
//           <FaCalendar/> Calendar
//         </NavLink>
//         <NavLink to="/notifications" className={linkClass}>
//           <FaBell/> Notifications
//         </NavLink>
//         <NavLink to="/media-files" className={linkClass}>
//           <FaFile/> Media Files
//         </NavLink>
//         <NavLink to="/faq" className={linkClass}>
//           <FaQuestionCircle/> FAQ
//         </NavLink>
//         <NavLink to="/hierarchy" className={linkClass}>
//           <FaSitemap/> Command Hierarchy
//         </NavLink>
//         <NavLink to="/events" className={linkClass}>
//           <FaCalendarAlt/> Special Events
//         </NavLink>

//         {show(EVENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/events" className={linkClass}>
//             <FaCalendarAlt/> Admin Events
//           </NavLink>
//         )}

//         {show(ADMIN_USER_ROLES) && (
//           <NavLink to="/admin/users" className={linkClass}>
//             <FaUsers/> User Management
//           </NavLink>
//         )}

//         {/* Announcements for everyone */}
//         <NavLink to="/announcements" className={linkClass}>
//           <FaBullhorn/> Announcements
//           {annCount > 0 && <span className="badge">{annCount}</span>}
//         </NavLink>

//         {/* Manage Announcements for creators */}
//         {show(ANNOUNCEMENT_CREATOR_ROLES) && (
//           <NavLink to="/admin/announcements" className={linkClass}>
//             <FaBullhorn/> Manage Announcements
//           </NavLink>
//         )}

//         {show(SUPERVISOR_ROLES) && (
//           <NavLink to="/overview" className={linkClass}>
//             <FaChartBar/> Overview
//           </NavLink>
//         )}

//         {/* CSO Leave */}
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

//         {/* Security Leave */}
//         {user?.division === SECURITY_DIVISION &&
//          show(SECURITY_OFFICER_ROLES) && (
//           <NavLink to="/security/leave" className={linkClass}>
//             Request Security Leave
//           </NavLink>
//         )}
//         {user?.division === SECURITY_DIVISION &&
//          show(SECURITY_LEAVE_APPROVER_ROLES) && (
//           <NavLink to="/security/leave/approve" className={linkClass}>
//             Approve Security Leave
//           </NavLink>
//         )}
//       </nav>

//       <button onClick={onLogout} className="logout-button">
//         Logout
//       </button>
//     </div>
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
  FaQuestionCircle,
  FaCalendarAlt,
  FaChartBar,
  FaSitemap,
  FaUsers,
  FaBullhorn,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(false);
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

  const show = roles => user && roles.includes(user.user_rank);

  return (
    <aside className={`sidebar ${dark ? 'dark' : 'light'}`}>
      <header className="sidebar-header">
        <h2 className="sidebar-title">CSO<br/>Rutgers</h2>
        <button
          className="theme-toggle"
          onClick={() => setDark(d => !d)}
          aria-label="Toggle theme"
        >
          {dark ? <FaSun/> : <FaMoon/>}
        </button>
      </header>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard"     className={linkClass}><FaHome/> Dashboard</NavLink>
        <NavLink to="/coverages"     className={linkClass}><FaUserCheck/> Coverage Requests</NavLink>
        <NavLink to="/calendar"      className={linkClass}><FaCalendar/> Calendar</NavLink>
        <NavLink to="/notifications" className={linkClass}><FaBell/> Notifications</NavLink>
        <NavLink to="/media-files"   className={linkClass}><FaFile/> Media Files</NavLink>
        <NavLink to="/faq"           className={linkClass}><FaQuestionCircle/> FAQ</NavLink>
        <NavLink to="/hierarchy"     className={linkClass}><FaSitemap/> Command Hierarchy</NavLink>
        <NavLink to="/events"        className={linkClass}><FaCalendarAlt/> Special Events</NavLink>

        {show(EVENT_CREATOR_ROLES) && (
          <NavLink to="/admin/events" className={linkClass}>
            <FaCalendarAlt/> Admin Events
          </NavLink>
        )}

        {show(ADMIN_USER_ROLES) && (
          <NavLink to="/admin/users" className={linkClass}>
            <FaUsers/> User Management
          </NavLink>
        )}

        <NavLink to="/announcements" className={linkClass}>
          <FaBullhorn/> Announcements
          {annCount > 0 && <span className="badge">{annCount}</span>}
        </NavLink>

        {show(ANNOUNCEMENT_CREATOR_ROLES) && (
          <NavLink to="/admin/announcements" className={linkClass}>
            <FaBullhorn/> Manage Announcements
          </NavLink>
        )}

        {show(SUPERVISOR_ROLES) && (
          <NavLink to="/overview" className={linkClass}><FaChartBar/> Overview</NavLink>
        )}

        {show(CSO_LEAVE_REQUESTER_ROLES) && (
          <NavLink to="/cso/leave" className={linkClass}>Request CSO Leave</NavLink>
        )}
        {show(CSO_LEAVE_APPROVER_ROLES) && (
          <NavLink to="/cso/leave/approve" className={linkClass}>Approve CSO Leave</NavLink>
        )}
        {show(CSO_MANDATE_ROLES) && (
          <NavLink to="/cso/mandate" className={linkClass}>Mandate CSO Shift</NavLink>
        )}

        {user?.division === SECURITY_DIVISION &&
         show(SECURITY_OFFICER_ROLES) && (
          <NavLink to="/security/leave" className={linkClass}>Request Security Leave</NavLink>
        )}
        {user?.division === SECURITY_DIVISION &&
         show(SECURITY_LEAVE_APPROVER_ROLES) && (
          <NavLink to="/security/leave/approve" className={linkClass}>Approve Security Leave</NavLink>
        )}
      </nav>

      <button onClick={onLogout} className="logout-btn">Logout</button>
    </aside>
  );
}
