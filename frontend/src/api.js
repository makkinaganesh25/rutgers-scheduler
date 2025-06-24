// // src/api.js
// import axios from 'axios';

// const API_BASE = process.env.REACT_APP_API_BASE_URL;
// const api = axios.create({
//   baseURL: API_BASE,
//   headers: { 'Content-Type': 'application/json' },
// });
// api.interceptors.request.use(cfg => {
//   const t = localStorage.getItem('token');
//   if (t) cfg.headers.Authorization = `Bearer ${t}`;
//   return cfg;
// });

// // — Media Files endpoint
// export function fetchMediaTree() {
//   // GET /api/media-files
//   return api.get('/api/media-files').then(r => r.data);
// }

// // — Shifts / Coverage
// export function getShifts() {
//   return api.get('/api/shifts').then(r => r.data);
// }
// export function requestCoverage(id) {
//   return api
//     .post('/api/shifts/coverage-request', { shiftId: id })
//     .then(r => r.data);
// }
// export function acceptCoverage(id) {
//   return api
//     .post('/api/shifts/coverage-accept', { shiftId: id })
//     .then(r => r.data);
// }

// // — Special Events
// export function listEvents() {
//   return api.get('/api/events').then(r => r.data);
// }
// export function createEvent(evt) {
//   return api.post('/api/events', evt).then(r => r.data);
// }
// export function addSlots(eid, slots) {
//   return api
//     .post(`/api/events/${eid}/slots`, { slots })
//     .then(r => r.data);
// }
// export function listSlots(eid) {
//   return api.get(`/api/events/${eid}/slots`).then(r => r.data);
// }
// export function claimSlot(eid, sid) {
//   return api
//     .post(`/api/events/${eid}/slots/${sid}/claim`)
//     .then(r => r.data);
// }

// // — Event updates/deletes
// export function updateEvent(id, data) {
//   return api.put(`/api/events/${id}`, data).then(r => r.data);
// }
// export function updateEventSlot(eventId, slotId, slot) {
//   return api
//     .patch(`/api/events/${eventId}/slots/${slotId}`, slot)
//     .then(r => r.data);
// }
// export function deleteEvent(id) {
//   return api.delete(`/api/events/${id}`).then(r => r.data);
// }

// // — Hierarchy CRUD
// export function getHierarchy() {
//   return api.get('/api/hierarchy').then(r => r.data);
// }
// export function createUser(node) {
//   return api.post('/api/hierarchy', node).then(r => r.data);
// }
// export function updateUser(id, upd) {
//   return api.patch(`/api/hierarchy/${id}`, upd).then(r => r.data);
// }
// export function deleteUser(id) {
//   return api.delete(`/api/hierarchy/${id}`).then(r => r.data);
// }

// // — Admin Users CRUD
// export function getAdminUsers(showInactive = false) {
//   const qs = showInactive ? '?showInactive=true' : '';
//   return api.get(`/api/admin/users${qs}`).then(r => r.data);
// }
// export function createAdminUser(user) {
//   return api.post('/api/admin/users', user).then(r => r.data);
// }
// export function updateAdminUser(id, u) {
//   return api.put(`/api/admin/users/${id}`, u).then(r => r.data);
// }
// export function deleteAdminUser(id) {
//   return api.delete(`/api/admin/users/${id}`);
// }

// // — CSO Leave
// export function applyCsoLeave(data) {
//   return api.post('/api/cso/leave', data).then(r => r.data);
// }
// export function listMyCsoLeave() {
//   return api.get('/api/cso/leave').then(r => r.data);
// }
// export function listAllCsoLeave() {
//   return api.get('/api/cso/leave/all').then(r => r.data);
// }
// export function updateCsoLeave(id, status) {
//   return api
//     .patch(`/api/cso/leave/${id}`, { status })
//     .then(r => r.data);
// }
// // — Announcements CRUD
// // … everything else unchanged …

// // Announcements CRUD
// export function listAnnouncements(opts = {}) {
//   const q = opts.starred ? '?starred=true' : '';
//   return api.get(`/api/announcements${q}`).then(r => r.data);
// }
// export function createAnnouncement(data) {
//   return api.post('/api/announcements', data).then(r => r.data);
// }
// export function updateAnnouncement(id, data) {
//   return api.put(`/api/announcements/${id}`, data).then(r => r.data);
// }
// export function deleteAnnouncement(id) {
//   return api.delete(`/api/announcements/${id}`).then(r => r.data);
// }
// export function deleteAnnouncementFiles(id) {
//   return api.delete(`/api/announcements/${id}/files`).then(r => r.data);
// }
// export function uploadAnnouncementFiles(id, formData) {
//   return api
//     .post(`/api/announcements/${id}/files`, formData, { headers: {'Content-Type':'multipart/form-data'} })
//     .then(r => r.data);
// }

// // Star / unstar
// export function starAnnouncement(id) {
//   return api.post(`/api/announcements/${id}/star`).then(r => r.data);
// }
// export function unstarAnnouncement(id) {
//   return api.delete(`/api/announcements/${id}/star`).then(r => r.data);
// }


// // … rest unchanged …



// // — CSO Mandate
// export function getCsoMandateAvailability(params) {
//   return api
//     .get('/api/cso/mandates/availability', { params })
//     .then(r => r.data);
// }
// export function postCsoMandate(data) {
//   return api.post('/api/cso/mandates', data).then(r => r.data);
// }

// // — Security Leave
// export function applySecurityLeave(data) {
//   return api.post('/api/security/leave', data).then(r => r.data);
// }
// export function listMySecurityLeave() {
//   return api.get('/api/security/leave').then(r => r.data);
// }
// export function listAllSecurityLeave() {
//   return api.get('/api/security/leave/all').then(r => r.data);
// }
// export function updateSecurityLeave(id, st) {
//   return api
//     .patch(`/api/security/leave/${id}`, { status: st })
//     .then(r => r.data);
// }

// export default api;


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
