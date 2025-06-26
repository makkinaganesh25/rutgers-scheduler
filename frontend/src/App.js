// // src/App.js
// import React, { useState, useEffect } from 'react'; // <-- Make sure useEffect is imported
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation
// } from 'react-router-dom';

// import { AuthProvider } from './contexts/AuthContext';
// import { NotificationsProvider } from './contexts/NotificationsContext';
// import AuthenticatedRoute, { RoleRoute } from './components/AuthenticatedRoute';
// import { FaBars } from 'react-icons/fa';

// // --- Role Imports ---
// import {
//   SUPERVISOR_ROLES,
//   EVENT_CREATOR_ROLES,
//   ADMIN_USER_ROLES,
//   ANNOUNCEMENT_CREATOR_ROLES,
//   CSO_LEAVE_REQUESTER_ROLES,
//   CSO_LEAVE_APPROVER_ROLES,
//   CSO_MANDATE_ROLES,
//   SECURITY_OFFICER_ROLES,
//   SECURITY_LEAVE_APPROVER_ROLES
// } from './config/roles';

// // --- Page/Component Imports ---
// import Sidebar from './components/Sidebar';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import Coverages from './pages/Coverages';
// import Calendar from './pages/Calendar';
// import Notifications from './pages/Notifications';
// import MediaFiles from './pages/MediaFiles';
// import FAQ from './pages/FAQ';
// import ShiftList from './pages/ShiftList';
// import SpecialEventsList from './pages/SpecialEventsList';
// import EventSlots from './pages/EventSlots';
// import AdminEvents from './pages/AdminEvents';
// import AdminUsers from './pages/AdminUsers';
// import Overview from './pages/Overview';
// import CommandHierarchy from './pages/CommandHierarchy';
// import Chatbot from './components/Chatbot';
// import CsoLeaveRequest from './pages/CsoLeaveRequest';
// import CsoLeaveApproval from './pages/CsoLeaveApproval';
// import CsoMandate from './pages/CsoMandate';
// import SecurityLeaveRequest from './pages/SecurityLeaveRequest';
// import SecurityLeaveApproval from './pages/SecurityLeaveApproval';
// import Announcements from './pages/Announcements';
// import AdminAnnouncements from './pages/AdminAnnouncements';

// /**
//  * A custom hook to check if a media query matches.
//  * This is how we will detect if the user is on a desktop or mobile screen.
//  * @param {string} query The media query string (e.g., '(min-width: 768px)')
//  * @returns {boolean} True if the media query matches, false otherwise.
//  */
// const useMediaQuery = (query) => {
//   const [matches, setMatches] = useState(window.matchMedia(query).matches);

//   useEffect(() => {
//     const media = window.matchMedia(query);
//     const listener = () => setMatches(media.matches);
    
//     // Support for modern browsers
//     if (media.addEventListener) {
//       media.addEventListener('change', listener);
//     } else {
//       // Fallback for older browsers
//       media.addListener(listener);
//     }

//     return () => {
//       if (media.removeEventListener) {
//         media.removeEventListener('change', listener);
//       } else {
//         media.removeListener(listener);
//       }
//     };
//   }, [query]);

//   return matches;
// };


// function AppContent() {
//   const { pathname } = useLocation();
//   const [isSidebarOpen, setSidebarOpen] = useState(false);
  
//   // This hook will return `true` if the screen width is 768px or greater.
//   const isDesktop = useMediaQuery('(min-width: 768px)');

//   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

//   if (pathname === '/') {
//     return (
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   // Define the style for the button directly here.
//   // This style will only be applied to the button when it's rendered on mobile.
//   const mobileButtonStyle = {
//     position: 'fixed',
//     bottom: '20px',
//     left: '20px',
//     zIndex: 1001,
//     background: '#8e1e1e',
//     color: 'white',
//     border: 'none',
//     borderRadius: '50%',
//     width: '40px',
//     height: '40px',
//     fontSize: '1rem',
//     cursor: 'pointer',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   };

//   return (
//     <div className="app-container">
//       {/* CONDITIONAL RENDERING:
//         The button is now only rendered if `isDesktop` is false.
//         This completely prevents it from appearing on larger screens.
//       */}
//       {!isDesktop && (
//         <button style={mobileButtonStyle} onClick={toggleSidebar} aria-label="Open menu">
//           <FaBars />
//         </button>
//       )}

//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       <div className="main-content">
//         <Routes>
//           {/* All your routes remain exactly the same */}
//           <Route element={<AuthenticatedRoute />}>
//             <Route path="/hierarchy" element={<CommandHierarchy />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/coverages" element={<Coverages />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/media-files" element={<MediaFiles />} />
//             <Route path="/faq" element={<FAQ />} />
//             <Route path="/shifts" element={<ShiftList />} />
//             <Route path="/events">
//               <Route index element={<SpecialEventsList />} />
//               <Route path=":id" element={<EventSlots />} />
//             </Route>
//             <Route path="/admin/events" element={<RoleRoute allowedRoles={EVENT_CREATOR_ROLES}><AdminEvents /></RoleRoute>} />
//             <Route path="/admin/users" element={<RoleRoute allowedRoles={ADMIN_USER_ROLES}><AdminUsers /></RoleRoute>} />
//             <Route path="/announcements" element={<Announcements />} />
//             <Route path="/admin/announcements" element={<RoleRoute allowedRoles={ANNOUNCEMENT_CREATOR_ROLES}><AdminAnnouncements /></RoleRoute>} />
//             <Route path="/overview" element={<RoleRoute allowedRoles={SUPERVISOR_ROLES}><Overview /></RoleRoute>} />
//             <Route path="/cso/leave" element={<RoleRoute allowedRoles={CSO_LEAVE_REQUESTER_ROLES}><CsoLeaveRequest /></RoleRoute>} />
//             <Route path="/cso/leave/approve" element={<RoleRoute allowedRoles={CSO_LEAVE_APPROVER_ROLES}><CsoLeaveApproval /></RoleRoute>} />
//             <Route path="/cso/mandate" element={<RoleRoute allowedRoles={CSO_MANDATE_ROLES}><CsoMandate /></RoleRoute>} />
//             <Route path="/security/leave" element={<RoleRoute allowedRoles={SECURITY_OFFICER_ROLES}><SecurityLeaveRequest /></RoleRoute>} />
//             <Route path="/security/leave/approve" element={<RoleRoute allowedRoles={SECURITY_LEAVE_APPROVER_ROLES}><SecurityLeaveApproval /></RoleRoute>} />
//             <Route path="*" element={<Navigate to="/dashboard" replace />} />
//           </Route>
//         </Routes>
//       </div>
//       <Chatbot />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <NotificationsProvider>
//         <BrowserRouter>
//           <AppContent />
//         </BrowserRouter>
//       </NotificationsProvider>
//     </AuthProvider>
//   );
// }

//-------------------------------------------------------------------------------------------------------------------------------
// // src/App.js

// import React, { useState, useEffect } from 'react';
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation
// } from 'react-router-dom';

// import { AuthProvider } from './contexts/AuthContext';
// import { NotificationsProvider } from './contexts/NotificationsContext';
// import AuthenticatedRoute, { RoleRoute } from './components/AuthenticatedRoute';
// import { FaBars } from 'react-icons/fa';

// // --- Role Imports ---
// import {
//   SUPERVISOR_ROLES,
//   EVENT_CREATOR_ROLES,
//   ADMIN_USER_ROLES,
//   ANNOUNCEMENT_CREATOR_ROLES,
//   CSO_LEAVE_REQUESTER_ROLES,
//   CSO_LEAVE_APPROVER_ROLES,
//   CSO_MANDATE_ROLES,
//   SECURITY_OFFICER_ROLES,
//   SECURITY_LEAVE_APPROVER_ROLES
// } from './config/roles';

// // --- Page/Component Imports ---
// import Sidebar from './components/Sidebar';
// import Login from './pages/Login';
// import Dashboard from './pages/Dashboard';
// import Coverages from './pages/Coverages';
// import Calendar from './pages/Calendar';
// import Notifications from './pages/Notifications';
// import MediaFiles from './pages/MediaFiles';
// import FAQ from './pages/FAQ';
// import ShiftList from './pages/ShiftList';
// import SpecialEventsList from './pages/SpecialEventsList';
// import EventSlots from './pages/EventSlots';
// import AdminEvents from './pages/AdminEvents';
// import AdminUsers from './pages/AdminUsers';
// import Overview from './pages/Overview';
// import CommandHierarchy from './pages/CommandHierarchy';
// import Chatbot from './components/Chatbot';
// import Announcements from './pages/Announcements';
// import AdminAnnouncements from './pages/AdminAnnouncements';
// import CsoLeaveRequest from './pages/CsoLeaveRequest';
// import CsoLeaveApproval from './pages/CsoLeaveApproval';
// import CsoMandate from './pages/CsoMandate';
// import SecurityLeaveRequest from './pages/SecurityLeaveRequest';
// import SecurityLeaveApproval from './pages/SecurityLeaveApproval';

// // --- Local PermanentShifts Integration ---
// import PermanentShifts from './pages/PermanentShifts';
// const PERMANENT_SHIFT_ROLES = ADMIN_USER_ROLES;

// /**
//  * A custom hook to check if a media query matches.
//  * @param {string} query The media query string (e.g., '(min-width: 768px)')
//  * @returns {boolean}
//  */
// const useMediaQuery = (query) => {
//   const [matches, setMatches] = useState(window.matchMedia(query).matches);

//   useEffect(() => {
//     const media = window.matchMedia(query);
//     const listener = () => setMatches(media.matches);

//     if (media.addEventListener) {
//       media.addEventListener('change', listener);
//     } else {
//       media.addListener(listener);
//     }
//     return () => {
//       if (media.removeEventListener) {
//         media.removeEventListener('change', listener);
//       } else {
//         media.removeListener(listener);
//       }
//     };
//   }, [query]);

//   return matches;
// };

// function AppContent() {
//   const { pathname } = useLocation();
//   const [isSidebarOpen, setSidebarOpen] = useState(false);

//   // Desktop detection
//   const isDesktop = useMediaQuery('(min-width: 768px)');
//   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

//   // Public login route
//   if (pathname === '/') {
//     return (
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   // Mobile toggle button style
//   const mobileButtonStyle = {
//     position: 'fixed',
//     bottom: '20px',
//     left: '20px',
//     zIndex: 1001,
//     background: '#8e1e1e',
//     color: 'white',
//     border: 'none',
//     borderRadius: '50%',
//     width: '40px',
//     height: '40px',
//     fontSize: '1rem',
//     cursor: 'pointer',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//   };

//   return (
//     <div className="app-container">
//       {!isDesktop && (
//         <button style={mobileButtonStyle} onClick={toggleSidebar} aria-label="Open menu">
//           <FaBars />
//         </button>
//       )}

//       <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

//       <div className="main-content">
//         <Routes>
//           <Route element={<AuthenticatedRoute />}>
//             <Route path="/hierarchy" element={<CommandHierarchy />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/coverages" element={<Coverages />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/media-files" element={<MediaFiles />} />
//             <Route path="/faq" element={<FAQ />} />
//             <Route path="/shifts" element={<ShiftList />} />

//             {/* Permanent Shifts */}
//             <Route
//               path="/admin/permanent-shifts"
//               element={
//                 <RoleRoute allowedRoles={PERMANENT_SHIFT_ROLES}>
//                   <PermanentShifts />
//                 </RoleRoute>
//               }
//             />

//             {/* Special Events */}
//             <Route path="/events">
//               <Route index element={<SpecialEventsList />} />
//               <Route path=":id" element={<EventSlots />} />
//             </Route>
//             <Route
//               path="/admin/events"
//               element={
//                 <RoleRoute allowedRoles={EVENT_CREATOR_ROLES}>
//                   <AdminEvents />
//                 </RoleRoute>
//               }
//             />

//             {/* Admin Users */}
//             <Route
//               path="/admin/users"
//               element={
//                 <RoleRoute allowedRoles={ADMIN_USER_ROLES}>
//                   <AdminUsers />
//                 </RoleRoute>
//               }
//             />

//             {/* Announcements */}
//             <Route path="/announcements" element={<Announcements />} />
//             <Route
//               path="/admin/announcements"
//               element={
//                 <RoleRoute allowedRoles={ANNOUNCEMENT_CREATOR_ROLES}>
//                   <AdminAnnouncements />
//                 </RoleRoute>
//               }
//             />

//             {/* Overview */}
//             <Route
//               path="/overview"
//               element={
//                 <RoleRoute allowedRoles={SUPERVISOR_ROLES}>
//                   <Overview />
//                 </RoleRoute>
//               }
//             />

//             {/* CSO Leave & Mandates */}
//             <Route
//               path="/cso/leave"
//               element={
//                 <RoleRoute allowedRoles={CSO_LEAVE_REQUESTER_ROLES}>
//                   <CsoLeaveRequest />
//                 </RoleRoute>
//               }
//             />
//             <Route
//               path="/cso/leave/approve"
//               element={
//                 <RoleRoute allowedRoles={CSO_LEAVE_APPROVER_ROLES}>
//                   <CsoLeaveApproval />
//                 </RoleRoute>
//               }
//             />
//             <Route
//               path="/cso/mandate"
//               element={
//                 <RoleRoute allowedRoles={CSO_MANDATE_ROLES}>
//                   <CsoMandate />
//                 </RoleRoute>
//               }
//             />

//             {/* Security Leave */}
//             <Route
//               path="/security/leave"
//               element={
//                 <RoleRoute allowedRoles={SECURITY_OFFICER_ROLES}>
//                   <SecurityLeaveRequest />
//                 </RoleRoute>
//               }
//             />
//             <Route
//               path="/security/leave/approve"
//               element={
//                 <RoleRoute allowedRoles={SECURITY_LEAVE_APPROVER_ROLES}>
//                   <SecurityLeaveApproval />
//                 </RoleRoute>
//               }
//             />

//             {/* Fallback */}
//             <Route path="*" element={<Navigate to="/dashboard" replace />} />
//           </Route>
//         </Routes>
//       </div>

//       <Chatbot />
//     </div>
//   );
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <NotificationsProvider>
//         <BrowserRouter>
//           <AppContent />
//         </BrowserRouter>
//       </NotificationsProvider>
//     </AuthProvider>
//   );
// }
//-------------------------------------------------
// src/App.js

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import AuthenticatedRoute, { RoleRoute } from './components/AuthenticatedRoute';
import { FaBars } from 'react-icons/fa';

// --- Role Imports ---
import {
  SUPERVISOR_ROLES,
  EVENT_CREATOR_ROLES,
  ADMIN_USER_ROLES,
  ANNOUNCEMENT_CREATOR_ROLES,
  CSO_LEAVE_REQUESTER_ROLES,
  CSO_LEAVE_APPROVER_ROLES,
  CSO_MANDATE_ROLES,
  SECURITY_OFFICER_ROLES,
  SECURITY_LEAVE_APPROVER_ROLES
} from './config/roles';

// --- Page/Component Imports ---
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Coverages from './pages/Coverages';
import Calendar from './pages/Calendar';
import Notifications from './pages/Notifications';
import MediaFiles from './pages/MediaFiles';
import FAQ from './pages/FAQ';
import ShiftList from './pages/ShiftList';
import SpecialEventsList from './pages/SpecialEventsList';
import EventSlots from './pages/EventSlots';
import AdminEvents from './pages/AdminEvents';
import AdminUsers from './pages/AdminUsers';
import Overview from './pages/Overview';
import CommandHierarchy from './pages/CommandHierarchy';
import Chatbot from './components/Chatbot';
import Announcements from './pages/Announcements';
import AdminAnnouncements from './pages/AdminAnnouncements';
import CsoLeaveRequest from './pages/CsoLeaveRequest';
import CsoLeaveApproval from './pages/CsoLeaveApproval';
import CsoMandate from './pages/CsoMandate';
import SecurityLeaveRequest from './pages/SecurityLeaveRequest';
import SecurityLeaveApproval from './pages/SecurityLeaveApproval';
import PermanentShifts from './pages/PermanentShifts';

const PERMANENT_SHIFT_ROLES = ADMIN_USER_ROLES;

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);

    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      media.addListener(listener);
    }
    
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
};

function AppContent() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  // Separate layout for the login page
  if (pathname === '/') {
    return (
      <div className="app-container login-layout">
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    );
  }

  // Mobile button style object
  const mobileButtonStyle = {
    position: 'fixed',
    bottom: '20px',
    left: '20px',
    zIndex: 1001,
    background: '#8e1e1e',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '50px',  // Increased button size slightly
    height: '50px', // Increased button size slightly
    fontSize: '1.5rem', // CRITICAL FIX: Increased font size to make the icon larger
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  // Conditionally add the 'desktop-layout' class
  const appContainerClass = `app-container ${isDesktop ? 'desktop-layout' : ''}`;

  return (
    <div className={appContainerClass}>
      {!isDesktop && (
        <button style={mobileButtonStyle} onClick={toggleSidebar} aria-label="Open menu">
          <FaBars />
        </button>
      )}

      <Sidebar isOpen={isDesktop || isSidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="main-content">
        <Routes>
          <Route element={<AuthenticatedRoute />}>
            {/* All authenticated routes go here */}
            <Route path="/hierarchy" element={<CommandHierarchy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coverages" element={<Coverages />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/media-files" element={<MediaFiles />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shifts" element={<ShiftList />} />
            <Route path="/admin/permanent-shifts" element={<RoleRoute allowedRoles={PERMANENT_SHIFT_ROLES}><PermanentShifts /></RoleRoute>} />
            <Route path="/events" element={<SpecialEventsList />} />
            <Route path="/events/:id" element={<EventSlots />} />
            <Route path="/admin/events" element={<RoleRoute allowedRoles={EVENT_CREATOR_ROLES}><AdminEvents /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute allowedRoles={ADMIN_USER_ROLES}><AdminUsers /></RoleRoute>} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/admin/announcements" element={<RoleRoute allowedRoles={ANNOUNCEMENT_CREATOR_ROLES}><AdminAnnouncements /></RoleRoute>} />
            <Route path="/overview" element={<RoleRoute allowedRoles={SUPERVISOR_ROLES}><Overview /></RoleRoute>} />
            <Route path="/cso/leave" element={<RoleRoute allowedRoles={CSO_LEAVE_REQUESTER_ROLES}><CsoLeaveRequest /></RoleRoute>} />
            <Route path="/cso/leave/approve" element={<RoleRoute allowedRoles={CSO_LEAVE_APPROVER_ROLES}><CsoLeaveApproval /></RoleRoute>} />
            <Route path="/cso/mandate" element={<RoleRoute allowedRoles={CSO_MANDATE_ROLES}><CsoMandate /></RoleRoute>} />
            {/* THIS LINE WAS THE SOURCE OF THE ERROR. CORRECTED </RouteRoute> to </RoleRoute> */}
            <Route path="/security/leave" element={<RoleRoute allowedRoles={SECURITY_OFFICER_ROLES}><SecurityLeaveRequest /></RoleRoute>} />
            <Route path="/security/leave/approve" element={<RoleRoute allowedRoles={SECURITY_LEAVE_APPROVER_ROLES}><SecurityLeaveApproval /></RoleRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </div>
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </NotificationsProvider>
    </AuthProvider>
  );
}
