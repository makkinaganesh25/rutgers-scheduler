// // src/App.js
// import React from 'react';
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

// import Sidebar           from './components/Sidebar';
// import Login             from './pages/Login';
// import Dashboard         from './pages/Dashboard';
// import Coverages         from './pages/Coverages';
// import Calendar          from './pages/Calendar';
// import Notifications     from './pages/Notifications';
// import MediaFiles        from './pages/MediaFiles';
// import FAQ               from './pages/FAQ';
// import ShiftList         from './pages/ShiftList';
// import SpecialEventsList from './pages/SpecialEventsList';
// import EventSlots        from './pages/EventSlots';
// import AdminEvents       from './pages/AdminEvents';
// import AdminUsers        from './pages/AdminUsers';
// import Overview          from './pages/Overview';
// import CommandHierarchy  from './pages/CommandHierarchy';
// import Chatbot           from './components/Chatbot';

// // Announcements pages
// import Announcements      from './pages/Announcements';
// import AdminAnnouncements from './pages/AdminAnnouncements';

// // CSO Leave + Mandate pages
// import CsoLeaveRequest   from './pages/CsoLeaveRequest';
// import CsoLeaveApproval  from './pages/CsoLeaveApproval';
// import CsoMandate        from './pages/CsoMandate';

// // Security Leave pages
// import SecurityLeaveRequest  from './pages/SecurityLeaveRequest';
// import SecurityLeaveApproval from './pages/SecurityLeaveApproval';

// function AppContent() {
//   const { pathname } = useLocation();

//   // public login-only routes
//   if (pathname === '/') {
//     return (
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   // authenticated app
//   return (
//     <div className="app-container">
//       <Sidebar />
//       <div className="main-content">
//         <Routes>
//           <Route element={<AuthenticatedRoute />}>
//             {/* Core pages */}
//             <Route path="/hierarchy" element={<CommandHierarchy />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/coverages" element={<Coverages />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/media-files" element={<MediaFiles />} />
//             <Route path="/faq" element={<FAQ />} />
//             <Route path="/shifts" element={<ShiftList />} />

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

//             {/* Catch-all: redirect to dashboard */}
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



// // src/App.js (FINAL WORKING CODE)
// import React, { useState } from 'react';
// import {
//   BrowserRouter,
//   Routes,
//   Route,
//   Navigate,
//   useLocation
// } from 'react-router-dom';
// import { FaBars } from 'react-icons/fa';

// import { AuthProvider } from './contexts/AuthContext';
// import { NotificationsProvider } from './contexts/NotificationsContext';
// import AuthenticatedRoute, { RoleRoute } from './components/AuthenticatedRoute';

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

// // Announcements pages
// import Announcements from './pages/Announcements';
// import AdminAnnouncements from './pages/AdminAnnouncements';

// // CSO Leave + Mandate pages
// import CsoLeaveRequest from './pages/CsoLeaveRequest';
// import CsoLeaveApproval from './pages/CsoLeaveApproval';
// import CsoMandate from './pages/CsoMandate';

// // Security Leave pages
// import SecurityLeaveRequest from './pages/SecurityLeaveRequest';
// import SecurityLeaveApproval from './pages/SecurityLeaveApproval';

// function AppContent() {
//   const { pathname } = useLocation();
//   const [isSidebarOpen, setSidebarOpen] = useState(false);

//   const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

//   // public login-only routes
//   if (pathname === '/') {
//     return (
//       <Routes>
//         <Route path="/" element={<Login />} />
//         <Route path="*" element={<Navigate to="/" replace />} />
//       </Routes>
//     );
//   }

//   // authenticated app
//   return (
//     <div className="app-container">
//       <Sidebar isOpen={isSidebarOpen} />

//       {/* The className is now simplified to no longer hide the button */}
//       <button
//         className="sidebar-toggle"
//         onClick={toggleSidebar}
//         aria-label="Toggle sidebar"
//       >
//         <FaBars />
//       </button>

//       <div className="main-content">
//         <Routes>
//           <Route element={<AuthenticatedRoute />}>
//             {/* Core pages */}
//             <Route path="/hierarchy" element={<CommandHierarchy />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/coverages" element={<Coverages />} />
//             <Route path="/calendar" element={<Calendar />} />
//             <Route path="/notifications" element={<Notifications />} />
//             <Route path="/media-files" element={<MediaFiles />} />
//             <Route path="/faq" element={<FAQ />} />
//             <Route path="/shifts" element={<ShiftList />} />

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

//             {/* Catch-all: redirect to dashboard */}
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


// src/App.js
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import AuthenticatedRoute, { RoleRoute } from './components/AuthenticatedRoute';
import { SUPERVISOR_ROLES, EVENT_CREATOR_ROLES, ADMIN_USER_ROLES, ANNOUNCEMENT_CREATOR_ROLES, CSO_LEAVE_REQUESTER_ROLES, CSO_LEAVE_APPROVER_ROLES, CSO_MANDATE_ROLES, SECURITY_OFFICER_ROLES, SECURITY_LEAVE_APPROVER_ROLES } from './config/roles';

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

function AppContent() {
  const { pathname } = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (pathname === '/') {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <button className="global-hamburger-btn" onClick={toggleSidebar}>
        <FaBars />
      </button>

      <Sidebar isOpen={isSidebarOpen} />
      
      {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
      
      <div className={`main-content ${isSidebarOpen ? 'sidebar-is-open' : ''}`}>
        <Routes>
          <Route element={<AuthenticatedRoute />}>
            <Route path="/hierarchy" element={<CommandHierarchy />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/coverages" element={<Coverages />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/media-files" element={<MediaFiles />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shifts" element={<ShiftList />} />
            
            {/* --- THIS IS THE CORRECTED ROUTE SYNTAX --- */}
            <Route path="/events">
              <Route index element={<SpecialEventsList />} />
              <Route path=":id" element={<EventSlots />} />
            </Route>

            <Route path="/admin/events" element={<RoleRoute allowedRoles={EVENT_CREATOR_ROLES}><AdminEvents /></RoleRoute>} />
            <Route path="/admin/users" element={<RoleRoute allowedRoles={ADMIN_USER_ROLES}><AdminUsers /></RoleRoute>} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/admin/announcements" element={<RoleRoute allowedRoles={ANNOUNCEMENT_CREATOR_ROLES}><AdminAnnouncements /></RoleRoute>} />
            <Route path="/overview" element={<RoleRoute allowedRoles={SUPERVISOR_ROLES}><Overview /></RoleRoute>} />
            <Route path="/cso/leave" element={<RoleRoute allowedRoles={CSO_LEAVE_REQUESTER_ROLES}><CsoLeaveRequest /></RoleRoute>} />
            <Route path="/cso/leave/approve" element={<RoleRoute allowedRoles={CSO_LEAVE_APPROVER_ROLES}><CsoLeaveApproval /></RoleRoute>} />
            <Route path="/cso/mandate" element={<RoleRoute allowedRoles={CSO_MANDATE_ROLES}><CsoMandate /></RoleRoute>} />
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
