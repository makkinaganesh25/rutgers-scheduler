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


// src/api.js
import axios from 'axios';

// 1) Base URL from your .env
const API_BASE = process.env.REACT_APP_API_BASE_URL;  
// e.g. "https://rutgers-scheduler-backend.onrender.com"

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage if present
api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

// ────────────────────────────────────────────────────────────────
// Overview (org-chart) tree
// GET /api/overview/tree
// ────────────────────────────────────────────────────────────────
export function getOverviewTree() {
  return api.get('/api/overview/tree').then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Media Files (file-tree)
// GET /api/media-files
// ────────────────────────────────────────────────────────────────
export function fetchMediaTree() {
  return api.get('/api/media-files').then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Shifts & Coverage
// ────────────────────────────────────────────────────────────────
export function getShifts() {
  return api.get('/api/shifts').then(r => r.data);
}
export function requestCoverage(id) {
  return api.post('/api/shifts/coverage-request', { shiftId: id }).then(r => r.data);
}
export function acceptCoverage(id) {
  return api.post('/api/shifts/coverage-accept',  { shiftId: id }).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Special Events & Slots
// ────────────────────────────────────────────────────────────────
export function listEvents() {
  return api.get('/api/events').then(r => r.data);
}
export function createEvent(evt) {
  return api.post('/api/events', evt).then(r => r.data);
}
export function addSlots(eid, slots) {
  return api.post(`/api/events/${eid}/slots`, { slots }).then(r => r.data);
}
export function listSlots(eid) {
  return api.get(`/api/events/${eid}/slots`).then(r => r.data);
}
export function claimSlot(eid, sid) {
  return api.post(`/api/events/${eid}/slots/${sid}/claim`).then(r => r.data);
}
export function updateEvent(id, data) {
  return api.put(`/api/events/${id}`, data).then(r => r.data);
}
export function updateEventSlot(eid, sid, slot) {
  return api.patch(`/api/events/${eid}/slots/${sid}`, slot).then(r => r.data);
}
export function deleteEvent(id) {
  return api.delete(`/api/events/${id}`).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Hierarchy (org chart) CRUD
// ────────────────────────────────────────────────────────────────
export function getHierarchy() {
  return api.get('/api/hierarchy').then(r => r.data);
}
export function createUser(node) {
  return api.post('/api/hierarchy', node).then(r => r.data);
}
export function updateUser(id, upd) {
  return api.patch(`/api/hierarchy/${id}`, upd).then(r => r.data);
}
export function deleteUser(id) {
  return api.delete(`/api/hierarchy/${id}`).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Admin Users CRUD
// ────────────────────────────────────────────────────────────────
export function getAdminUsers(showInactive = false) {
  const qs = showInactive ? '?showInactive=true' : '';
  return api.get(`/api/admin/users${qs}`).then(r => r.data);
}
export function createAdminUser(user) {
  return api.post('/api/admin/users', user).then(r => r.data);
}
export function updateAdminUser(id, u) {
  return api.put(`/api/admin/users/${id}`, u).then(r => r.data);
}
export function deleteAdminUser(id) {
  return api.delete(`/api/admin/users/${id}`).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// CSO Leave
// ────────────────────────────────────────────────────────────────
export function applyCsoLeave(data) {
  return api.post('/api/cso/leave', data).then(r => r.data);
}
export function listMyCsoLeave() {
  return api.get('/api/cso/leave').then(r => r.data);
}
export function listAllCsoLeave() {
  return api.get('/api/cso/leave/all').then(r => r.data);
}
export function updateCsoLeave(id, status) {
  return api.patch(`/api/cso/leave/${id}`, { status }).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// CSO Mandates
// ────────────────────────────────────────────────────────────────
export function getCsoMandateAvailability(params) {
  return api.get('/api/cso/mandates/availability', { params }).then(r => r.data);
}
export function postCsoMandate(data) {
  return api.post('/api/cso/mandates', data).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Security Leave & Mandates
// ────────────────────────────────────────────────────────────────
export function applySecurityLeave(data) {
  return api.post('/api/security/leave', data).then(r => r.data);
}
export function listMySecurityLeave() {
  return api.get('/api/security/leave').then(r => r.data);
}
export function listAllSecurityLeave() {
  return api.get('/api/security/leave/all').then(r => r.data);
}
export function updateSecurityLeave(id, status) {
  return api.patch(`/api/security/leave/${id}`, { status }).then(r => r.data);
}
export function postSecurityMandate(data) {
  return api.post('/api/security/mandates', data).then(r => r.data);
}
export function getSecurityMandateAvailability(params) {
  return api.get('/api/security/mandates/availability', { params }).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Announcements CRUD & File Uploads
// ────────────────────────────────────────────────────────────────
export function listAnnouncements(opts = {}) {
  const q = opts.starred ? '?starred=true' : '';
  return api.get(`/api/announcements${q}`).then(r => r.data);
}
export function createAnnouncement(data) {
  return api.post('/api/announcements', data).then(r => r.data);
}
export function updateAnnouncement(id, data) {
  return api.put(`/api/announcements/${id}`, data).then(r => r.data);
}
export function deleteAnnouncement(id) {
  return api.delete(`/api/announcements/${id}`).then(r => r.data);
}
export function deleteAnnouncementFiles(id) {
  return api.delete(`/api/announcements/${id}/files`).then(r => r.data);
}
export function uploadAnnouncementFiles(id, formData) {
  return api
    .post(`/api/announcements/${id}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(r => r.data);
}
export function starAnnouncement(id) {
  return api.post(`/api/announcements/${id}/star`).then(r => r.data);
}
export function unstarAnnouncement(id) {
  return api.delete(`/api/announcements/${id}/star`).then(r => r.data);
}

// ────────────────────────────────────────────────────────────────
// Export the raw axios instance (if ever needed directly)
// ────────────────────────────────────────────────────────────────
export default api;
