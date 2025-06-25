// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './Coverages.css';

// export default function Coverages() {
//   const { user, logout } = useAuth();
//   const { addNotification } = useNotifications();

//   // Data
//   const [myShifts, setMyShifts]         = useState([]);
//   const [pendingCov, setPendingCov]     = useState([]);
//   const [pendingSwaps, setPendingSwaps] = useState([]);
//   const [candidates, setCandidates]     = useState({});

//   // Loading & errors
//   const [loading, setLoading] = useState({ my:true, cov:true, swaps:true });
//   const [errorMsg, setErrorMsg] = useState('');

//   // Swap modal state
//   const [swapModal, setSwapModal] = useState({
//     open: false,
//     requesterShiftId: null
//   });
//   const [chosenOfficer, setChosenOfficer] = useState('');
//   const [theirShifts, setTheirShifts]     = useState([]);
//   const [targetShiftId, setTargetShiftId] = useState('');
//   const [conflictPre, setConflictPre]     = useState(null);

//   const fmtDate = iso => new Date(iso).toLocaleDateString();
//   const fmtTime = t   => t.slice(0,5);

//   // Loaders
//   const loadMy = useCallback(async () => {
//     setLoading(l => ({ ...l, my: true }));
//     try {
//       const { data } = await api.get('/api/shifts/me');
//       setMyShifts(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, my: false }));
//     }
//   }, [logout]);

//   const loadCov = useCallback(async () => {
//     setLoading(l => ({ ...l, cov: true }));
//     try {
//       const { data } = await api.get('/api/shifts/coverage-requests/pending');
//       setPendingCov(data.filter(r => r.requester_officer !== user.username));
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, cov: false }));
//     }
//   }, [logout, user.username]);

//   const loadSwaps = useCallback(async () => {
//     setLoading(l => ({ ...l, swaps: true }));
//     try {
//       const { data } = await api.get('/api/shifts/swap-requests/pending');
//       setPendingSwaps(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, swaps: false }));
//     }
//   }, [logout]);

//   useEffect(() => {
//     loadMy(); loadCov(); loadSwaps();
//   }, [loadMy, loadCov, loadSwaps]);

//   // Coverage handlers
//   const requestCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-request', { shiftId: id });
//       addNotification({ title:'Coverage Requested' });
//       loadMy(); loadCov();
//     } catch (e) {
//       console.error(e);
//     }
//   };
//   const acceptCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-accept', { shiftId: id });
//       loadMy(); loadCov();
//     } catch (e) {
//       if (e.response?.status===409) {
//         setErrorMsg('⚠️ Overlap detected. Cannot accept.');
//       }
//     }
//   };

//   // Open swap modal
//   const openSwap = async id => {
//     setSwapModal({ open:true, requesterShiftId: id });
//     setChosenOfficer(''); setTheirShifts([]); setTargetShiftId('');
//     setConflictPre(null);
//     try {
//       const { data } = await api.get(`/api/shifts/swaps/${id}/candidates`);
//       setCandidates(data);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   // When officer chosen
//   useEffect(() => {
//     setTheirShifts(
//       chosenOfficer ? candidates[chosenOfficer] || [] : []
//     );
//   }, [chosenOfficer, candidates]);

//   // Pre‐check conflict
//   useEffect(() => {
//     if (!targetShiftId) {
//       setConflictPre(null);
//       return;
//     }
//     const s = theirShifts.find(x => x.shift_id === Number(targetShiftId));
//     if (!s) return;

//     const conflict = myShifts.find(my =>
//       my.id !== swapModal.requesterShiftId &&
//       my.date === s.date &&
//       !(my.end_time <= s.start_time || my.start_time >= s.end_time)
//     );
//     setConflictPre(conflict || null);
//   }, [
//     targetShiftId,
//     theirShifts,
//     myShifts,
//     swapModal.requesterShiftId
//   ]);

//   // Submit swap
//   const submitSwap = async () => {
//     setErrorMsg('');
//     const payload = {
//       requester_shift_id: swapModal.requesterShiftId,
//       target_shift_id:    Number(targetShiftId)
//     };
//     try {
//       await api.post('/api/shifts/swap-request', payload);
//       addNotification({ title:'Swap Requested' });
//       setSwapModal({ open:false, requesterShiftId:null });
//       loadSwaps();
//     } catch (e) {
//       setErrorMsg(e.response?.data?.error || 'Unexpected error');
//     }
//   };

//   // Respond to swap
//   const respondSwap = async (reqId, action) => {
//     setErrorMsg('');
//     try {
//       await api.post(`/api/shifts/swap-requests/${reqId}/respond`, { action });
//       loadSwaps(); loadMy();
//     } catch (e) {
//       setErrorMsg(e.response?.data?.error || 'Swap conflict—cannot accept.');
//     }
//   };

//   return (
//     <div className="coverages-container">
//       <h1>Coverage & Swap Management</h1>
//       {errorMsg && <div className="error-message">{errorMsg}</div>}

//       {/* My Shifts */}
//       <section className="coverages-section">
//         <h2>My Shifts</h2>
//         {loading.my
//           ? <p>Loading…</p>
//           : !myShifts.length
//             ? <p>No shifts.</p>
//             : (
//               <ul className="coverages-list">
//                 {myShifts.map(s => (
//                   <li key={s.id}>
//                     <div className="info">
//                       {s.shift_type} on {fmtDate(s.date)}
//                       ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
//                     </div>
//                     <div className="actions">
//                       {s.status === 'requested'
//                         ? <span className="badge">Requested</span>
//                         : <button
//                             className="btn-cover"
//                             onClick={() => requestCoverage(s.id)}
//                           >
//                             Request Coverage
//                           </button>}
//                       {s.status === 'assigned' && (
//                         <button
//                           className="btn-swap"
//                           onClick={() => openSwap(s.id)}
//                         >
//                           Swap
//                         </button>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       {/* Pending Coverage */}
//       <section className="coverages-section">
//         <h2>Pending Coverage Requests</h2>
//         {loading.cov
//           ? <p>Loading…</p>
//           : !pendingCov.length
//             ? <p>No pending coverage.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingCov.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                       {r.shift_type} on {fmtDate(r.date)}
//                       ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})<br/>
//                       Requested by {r.requester_officer}
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => acceptCoverage(r.shift_id)}
//                       >
//                         Accept
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       {/* Pending Swaps */}
//       <section className="coverages-section">
//         <h2>Pending Swap Requests</h2>
//         {loading.swaps
//           ? <p>Loading…</p>
//           : !pendingSwaps.length
//             ? <p>No pending swaps.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingSwaps.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                       {r.requester_officer} wants{' '}
//                       <strong>{r.requester_shift.shift_type}</strong>{' '}
//                       ({fmtTime(r.requester_shift.start_time)}–{fmtTime(r.requester_shift.end_time)}){' '}
//                       for your <strong>{r.target_shift.shift_type}</strong>
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => respondSwap(r.request_id, 'accept')}
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="btn-swap"
//                         onClick={() => respondSwap(r.request_id, 'decline')}
//                       >
//                         Decline
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       {/* Swap Modal */}
//       {swapModal.open && (
//         <div className="swap-modal">
//           <div className="swap-content">
//             <h3>Swap Shift #{swapModal.requesterShiftId}</h3>

//             <label>Choose officer:</label>
//             <select
//               value={chosenOfficer}
//               onChange={e => setChosenOfficer(e.target.value)}
//             >
//               <option value="">— select person —</option>
//               {Object.keys(candidates).map(off => (
//                 <option key={off} value={off}>{off}</option>
//               ))}
//             </select>

//             <label>Select their shift:</label>
//             <select
//               value={targetShiftId}
//               onChange={e => setTargetShiftId(e.target.value)}
//               disabled={!chosenOfficer}
//             >
//               <option value="">— select shift —</option>
//               {theirShifts.map(s => (
//                 <option key={s.shift_id} value={s.shift_id}>
//                   {s.shift_type} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
//                 </option>
//               ))}
//             </select>

//             {conflictPre && (
//               <div className="error-message" style={{ marginTop:'0.5rem' }}>
//                 ⚠️ Conflict with your “{conflictPre.shift_type}” on {fmtDate(conflictPre.date)}.
//               </div>
//             )}

//             <div className="swap-buttons">
//               <button
//                 className="btn-accept"
//                 disabled={!targetShiftId || !!conflictPre}
//                 onClick={submitSwap}
//               >
//                 Submit Swap
//               </button>
//               <button
//                 className="btn-swap"
//                 onClick={() => setSwapModal({ open:false, requesterShiftId:null })}
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// // src/pages/Coverages.js
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './Coverages.css';

// export default function Coverages() {
//   const { user, logout } = useAuth();
//   const { addNotification } = useNotifications();

//   // Data
//   const [myShifts, setMyShifts]         = useState([]);
//   const [pendingCov, setPendingCov]     = useState([]);
//   const [pendingSwaps, setPendingSwaps] = useState([]);
//   const [candidates, setCandidates]     = useState({});

//   // Loading & errors
//   const [loading, setLoading] = useState({ my:true, cov:true, swaps:true });
//   const [errorMsg, setErrorMsg] = useState('');

//   // Swap modal state
//   const [swapModal, setSwapModal] = useState({
//     open: false,
//     requesterShiftId: null
//   });
//   const [chosenOfficer, setChosenOfficer] = useState('');
//   const [theirShifts, setTheirShifts]   = useState([]);
//   const [targetShiftId, setTargetShiftId] = useState('');
//   const [conflictPre, setConflictPre]     = useState(null);

//   const fmtDate = iso => new Date(iso).toLocaleDateString();
//   const fmtTime = t   => t.slice(0,5);

//   // Loaders
//   const loadMy = useCallback(async () => {
//     setLoading(l => ({ ...l, my: true }));
//     try {
//       const { data } = await api.get('/api/shifts/me');
//       setMyShifts(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, my: false }));
//     }
//   }, [logout]);

//   const loadCov = useCallback(async () => {
//     setLoading(l => ({ ...l, cov: true }));
//     try {
//       const { data } = await api.get('/api/shifts/coverage-requests/pending');
//       setPendingCov(data.filter(r => r.requester_officer !== user.username));
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, cov: false }));
//     }
//   }, [logout, user.username]);

//   const loadSwaps = useCallback(async () => {
//     setLoading(l => ({ ...l, swaps: true }));
//     try {
//       const { data } = await api.get('/api/shifts/swap-requests/pending');
//       setPendingSwaps(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, swaps: false }));
//     }
//   }, [logout]);

//   useEffect(() => {
//     loadMy(); loadCov(); loadSwaps();
//   }, [loadMy, loadCov, loadSwaps]);

//   // Handlers... (no changes to functionality)
//   const requestCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-request', { shiftId: id });
//       addNotification({ title:'Coverage Requested' });
//       loadMy(); loadCov();
//     } catch (e) { console.error(e); }
//   };
//   const acceptCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-accept', { shiftId: id });
//       loadMy(); loadCov();
//     } catch (e) { if (e.response?.status===409) setErrorMsg('⚠️ Overlap detected. Cannot accept.'); }
//   };
//   const openSwap = async id => {
//     setSwapModal({ open:true, requesterShiftId: id });
//     setChosenOfficer(''); setTheirShifts([]); setTargetShiftId('');
//     setConflictPre(null);
//     try {
//       const { data } = await api.get(`/api/shifts/swaps/${id}/candidates`);
//       setCandidates(data);
//     } catch (e) { console.error(e); }
//   };
//   useEffect(() => {
//     setTheirShifts(chosenOfficer ? candidates[chosenOfficer] || [] : []);
//   }, [chosenOfficer, candidates]);
//   useEffect(() => {
//     if (!targetShiftId) { setConflictPre(null); return; }
//     const s = theirShifts.find(x => x.shift_id === Number(targetShiftId));
//     if (!s) return;
//     const conflict = myShifts.find(my => my.id !== swapModal.requesterShiftId && my.date === s.date && !(my.end_time <= s.start_time || my.start_time >= s.end_time));
//     setConflictPre(conflict || null);
//   }, [targetShiftId, theirShifts, myShifts, swapModal.requesterShiftId]);
//   const submitSwap = async () => {
//     setErrorMsg('');
//     const payload = { requester_shift_id: swapModal.requesterShiftId, target_shift_id: Number(targetShiftId) };
//     try {
//       await api.post('/api/shifts/swap-request', payload);
//       addNotification({ title:'Swap Requested' });
//       setSwapModal({ open:false, requesterShiftId:null });
//       loadSwaps();
//     } catch (e) { setErrorMsg(e.response?.data?.error || 'Unexpected error'); }
//   };
//   const respondSwap = async (reqId, action) => {
//     setErrorMsg('');
//     try {
//       await api.post(`/api/shifts/swap-requests/${reqId}/respond`, { action });
//       loadSwaps(); loadMy();
//     } catch (e) { setErrorMsg(e.response?.data?.error || 'Swap conflict—cannot accept.'); }
//   };

//   return (
//     <div className="coverages-container">
//       <h1>Coverage & Swap Management</h1>
//       {errorMsg && <div className="error-message">{errorMsg}</div>}

//       <section className="coverages-section">
//         <h2>My Shifts</h2>
//         {loading.my
//           ? <p className="loading-text">Loading…</p>
//           : !myShifts.length
//             ? <p className="loading-text">No shifts.</p>
//             : (
//               <ul className="coverages-list">
//                 {myShifts.map(s => (
//                   <li key={s.id}>
//                     <div className="info">
//                       <span className="shift-title">{s.shift_type}</span>
//                       <span className="shift-details">
//                         {fmtDate(s.date)} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
//                       </span>
//                     </div>
//                     <div className="actions">
//                       {s.status === 'requested'
//                         ? <span className="badge">Requested</span>
//                         : <button
//                             className="btn-cover"
//                             onClick={() => requestCoverage(s.id)}
//                           >
//                             Request {/* <<< TEXT SHORTENED HERE */}
//                           </button>}
//                       {s.status === 'assigned' && (
//                         <button
//                           className="btn-swap"
//                           onClick={() => openSwap(s.id)}
//                         >
//                           Swap
//                         </button>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       <section className="coverages-section">
//         <h2>Pending Coverage Requests</h2>
//         {loading.cov
//           ? <p className="loading-text">Loading…</p>
//           : !pendingCov.length
//             ? <p className="loading-text">No pending coverage.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingCov.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                       <span className="shift-title">{r.shift_type}</span>
//                       <span className="shift-details">
//                         {fmtDate(r.date)} ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})
//                       </span>
//                       <span className="shift-requester">Requested by {r.requester_officer}</span>
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => acceptCoverage(r.shift_id)}
//                       >
//                         Accept
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       <section className="coverages-section">
//         <h2>Pending Swap Requests</h2>
//         {loading.swaps
//           ? <p className="loading-text">Loading…</p>
//           : !pendingSwaps.length
//             ? <p className="loading-text">No pending swaps.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingSwaps.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                         <span className="shift-requester">{r.requester_officer} requests a swap:</span>
//                         <span className="shift-details">
//                             <strong>Their {r.requester_shift.shift_type}</strong> for <strong>Your {r.target_shift.shift_type}</strong>
//                         </span>
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => respondSwap(r.request_id, 'accept')}
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="btn-decline"
//                         onClick={() => respondSwap(r.request_id, 'decline')}
//                       >
//                         Decline
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       {swapModal.open && (
//         <div className="swap-modal">
//           <div className="swap-content">
//             <h3>Swap Shift</h3>
//             <label htmlFor="officer-select">Choose officer:</label>
//             <select id="officer-select" value={chosenOfficer} onChange={e => setChosenOfficer(e.target.value)}>
//               <option value="">— select person —</option>
//               {Object.keys(candidates).map(off => (<option key={off} value={off}>{off}</option>))}
//             </select>
//             <label htmlFor="shift-select">Select their shift:</label>
//             <select id="shift-select" value={targetShiftId} onChange={e => setTargetShiftId(e.target.value)} disabled={!chosenOfficer}>
//               <option value="">— select shift —</option>
//               {theirShifts.map(s => (<option key={s.shift_id} value={s.shift_id}>{s.shift_type} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})</option>))}
//             </select>
//             {conflictPre && (<div className="error-message" style={{ marginTop:'0.5rem' }}>⚠️ Conflict with your “{conflictPre.shift_type}” on {fmtDate(conflictPre.date)}.</div>)}
//             <div className="swap-buttons">
//               <button className="btn-accept" disabled={!targetShiftId || !!conflictPre} onClick={submitSwap}>Submit Swap</button>
//               <button className="btn-decline" onClick={() => setSwapModal({ open:false, requesterShiftId:null })}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// // src/pages/Coverages.js
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './Coverages.css';

// // --- Helper Functions to get the current week ---
// const getStartOfWeek = (date) => {
//   const d = new Date(date);
//   const day = d.getDay();
//   const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
//   return new Date(d.setDate(diff));
// };

// const getEndOfWeek = (date) => {
//     const d = new Date(date);
//     const day = d.getDay();
//     const diff = d.getDate() - day + 7;
//     return new Date(d.setDate(diff));
// };

// const toISODateString = (date) => {
//     return date.toISOString().split('T')[0];
// };


// export default function Coverages() {
//   const { user, logout } = useAuth();
//   const { addNotification } = useNotifications();

//   // --- NEW: State for the date filters ---
//   const [dateFilter, setDateFilter] = useState({
//       startDate: toISODateString(getStartOfWeek(new Date())),
//       endDate: toISODateString(getEndOfWeek(new Date()))
//   });

//   // Data
//   const [myShifts, setMyShifts]         = useState([]);
//   const [pendingCov, setPendingCov]     = useState([]);
//   const [pendingSwaps, setPendingSwaps] = useState([]);
//   const [candidates, setCandidates]     = useState({});

//   // Loading & errors
//   const [loading, setLoading] = useState({ my:true, cov:true, swaps:true });
//   const [errorMsg, setErrorMsg] = useState('');

//   // Swap modal state
//   const [swapModal, setSwapModal] = useState({
//     open: false,
//     requesterShiftId: null
//   });
//   const [chosenOfficer, setChosenOfficer] = useState('');
//   const [theirShifts, setTheirShifts]   = useState([]);
//   const [targetShiftId, setTargetShiftId] = useState('');
//   const [conflictPre, setConflictPre]     = useState(null);

//   const fmtDate = iso => new Date(iso).toLocaleDateString();
//   const fmtTime = t   => t.slice(0,5);

//   // --- UPDATED: `loadMy` function now accepts date filters ---
//   const loadMy = useCallback(async () => {
//     setLoading(l => ({ ...l, my: true }));
//     try {
//       // Pass the dates as query parameters to the backend
//       const { data } = await api.get('/api/shifts/me', {
//           params: {
//               startDate: dateFilter.startDate,
//               endDate: dateFilter.endDate
//           }
//       });
//       setMyShifts(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, my: false }));
//     }
//   }, [logout, dateFilter]); // Dependency array now includes dateFilter

//   const loadCov = useCallback(async () => {
//     setLoading(l => ({ ...l, cov: true }));
//     try {
//       const { data } = await api.get('/api/shifts/coverage-requests/pending');
//       setPendingCov(data.filter(r => r.requester_officer !== user.username));
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, cov: false }));
//     }
//   }, [logout, user.username]);

//   const loadSwaps = useCallback(async () => {
//     setLoading(l => ({ ...l, swaps: true }));
//     try {
//       const { data } = await api.get('/api/shifts/swap-requests/pending');
//       setPendingSwaps(data);
//     } catch (e) {
//       if (e.response?.status===401) logout();
//     } finally {
//       setLoading(l => ({ ...l, swaps: false }));
//     }
//   }, [logout]);

//   useEffect(() => {
//     loadMy(); 
//     loadCov(); 
//     loadSwaps();
//   }, [loadMy, loadCov, loadSwaps]);

//   // Handlers... (no changes to functionality)
//   const requestCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-request', { shiftId: id });
//       addNotification({ title:'Coverage Requested' });
//       loadMy(); loadCov();
//     } catch (e) { console.error(e); }
//   };
//   const acceptCoverage = async id => {
//     setErrorMsg('');
//     try {
//       await api.post('/api/shifts/coverage-accept', { shiftId: id });
//       loadMy(); loadCov();
//     } catch (e) { if (e.response?.status===409) setErrorMsg('⚠️ Overlap detected. Cannot accept.'); }
//   };
//   const openSwap = async id => {
//     setSwapModal({ open:true, requesterShiftId: id });
//     setChosenOfficer(''); setTheirShifts([]); setTargetShiftId('');
//     setConflictPre(null);
//     try {
//       const { data } = await api.get(`/api/shifts/swaps/${id}/candidates`);
//       setCandidates(data);
//     } catch (e) { console.error(e); }
//   };
//   useEffect(() => {
//     setTheirShifts(chosenOfficer ? candidates[chosenOfficer] || [] : []);
//   }, [chosenOfficer, candidates]);
//   useEffect(() => {
//     if (!targetShiftId) { setConflictPre(null); return; }
//     const s = theirShifts.find(x => x.shift_id === Number(targetShiftId));
//     if (!s) return;
//     const conflict = myShifts.find(my => my.id !== swapModal.requesterShiftId && my.date === s.date && !(my.end_time <= s.start_time || my.start_time >= s.end_time));
//     setConflictPre(conflict || null);
//   }, [targetShiftId, theirShifts, myShifts, swapModal.requesterShiftId]);
//   const submitSwap = async () => {
//     setErrorMsg('');
//     const payload = { requester_shift_id: swapModal.requesterShiftId, target_shift_id: Number(targetShiftId) };
//     try {
//       await api.post('/api/shifts/swap-request', payload);
//       addNotification({ title:'Swap Requested' });
//       setSwapModal({ open:false, requesterShiftId:null });
//       loadSwaps();
//     } catch (e) { setErrorMsg(e.response?.data?.error || 'Unexpected error'); }
//   };
//   const respondSwap = async (reqId, action) => {
//     setErrorMsg('');
//     try {
//       await api.post(`/api/shifts/swap-requests/${reqId}/respond`, { action });
//       loadSwaps(); loadMy();
//     } catch (e) { setErrorMsg(e.response?.data?.error || 'Swap conflict—cannot accept.'); }
//   };

//   const handleDateChange = (e) => {
//       setDateFilter(prev => ({
//           ...prev,
//           [e.target.name]: e.target.value
//       }));
//   };

//   return (
//     <div className="coverages-container">
//       <h1>Coverage & Swap Management</h1>
//       {errorMsg && <div className="error-message">{errorMsg}</div>}

//       <section className="coverages-section">
//         <div className="section-header">
//             <h2>My Shifts</h2>
//             {/* --- NEW: Date filter inputs --- */}
//             <div className="date-filters">
//                 <div className="filter-group">
//                     <label htmlFor="startDate">From:</label>
//                     <input type="date" id="startDate" name="startDate" value={dateFilter.startDate} onChange={handleDateChange} />
//                 </div>
//                 <div className="filter-group">
//                     <label htmlFor="endDate">To:</label>
//                     <input type="date" id="endDate" name="endDate" value={dateFilter.endDate} onChange={handleDateChange} />
//                 </div>
//             </div>
//         </div>
//         {loading.my
//           ? <p className="loading-text">Loading…</p>
//           : !myShifts.length
//             ? <p className="loading-text">No shifts found for this date range.</p>
//             : (
//               <ul className="coverages-list">
//                 {myShifts.map(s => (
//                   <li key={s.id}>
//                     <div className="info">
//                       <span className="shift-title">{s.shift_type}</span>
//                       <span className="shift-details">
//                         {fmtDate(s.date)} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
//                       </span>
//                     </div>
//                     <div className="actions">
//                       {s.status === 'requested'
//                         ? <span className="badge">Requested</span>
//                         : <button
//                             className="btn-cover"
//                             onClick={() => requestCoverage(s.id)}
//                           >
//                             Request {/* <<< TEXT SHORTENED HERE */}
//                           </button>}
//                       {s.status === 'assigned' && (
//                         <button
//                           className="btn-swap"
//                           onClick={() => openSwap(s.id)}
//                         >
//                           Swap
//                         </button>
//                       )}
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       <section className="coverages-section">
//         <h2>Pending Coverage Requests</h2>
//         {loading.cov
//           ? <p className="loading-text">Loading…</p>
//           : !pendingCov.length
//             ? <p className="loading-text">No pending coverage.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingCov.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                       <span className="shift-title">{r.shift_type}</span>
//                       <span className="shift-details">
//                         {fmtDate(r.date)} ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})
//                       </span>
//                       <span className="shift-requester">Requested by {r.requester_officer}</span>
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => acceptCoverage(r.shift_id)}
//                       >
//                         Accept
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       <section className="coverages-section">
//         <h2>Pending Swap Requests</h2>
//         {loading.swaps
//           ? <p className="loading-text">Loading…</p>
//           : !pendingSwaps.length
//             ? <p className="loading-text">No pending swaps.</p>
//             : (
//               <ul className="coverages-list">
//                 {pendingSwaps.map(r => (
//                   <li key={r.request_id}>
//                     <div className="info">
//                         <span className="shift-requester">{r.requester_officer} requests a swap:</span>
//                         <span className="shift-details">
//                             <strong>Their {r.requester_shift.shift_type}</strong> for <strong>Your {r.target_shift.shift_type}</strong>
//                         </span>
//                     </div>
//                     <div className="actions">
//                       <button
//                         className="btn-accept"
//                         onClick={() => respondSwap(r.request_id, 'accept')}
//                       >
//                         Accept
//                       </button>
//                       <button
//                         className="btn-decline"
//                         onClick={() => respondSwap(r.request_id, 'decline')}
//                       >
//                         Decline
//                       </button>
//                     </div>
//                   </li>
//                 ))}
//               </ul>
//             )}
//       </section>

//       {swapModal.open && (
//         <div className="swap-modal">
//           <div className="swap-content">
//             <h3>Swap Shift</h3>
//             <label htmlFor="officer-select">Choose officer:</label>
//             <select id="officer-select" value={chosenOfficer} onChange={e => setChosenOfficer(e.target.value)}>
//               <option value="">— select person —</option>
//               {Object.keys(candidates).map(off => (<option key={off} value={off}>{off}</option>))}
//             </select>
//             <label htmlFor="shift-select">Select their shift:</label>
//             <select id="shift-select" value={targetShiftId} onChange={e => setTargetShiftId(e.target.value)} disabled={!chosenOfficer}>
//               <option value="">— select shift —</option>
//               {theirShifts.map(s => (<option key={s.shift_id} value={s.shift_id}>{s.shift_type} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})</option>))}
//             </select>
//             {conflictPre && (<div className="error-message" style={{ marginTop:'0.5rem' }}>⚠️ Conflict with your “{conflictPre.shift_type}” on {fmtDate(conflictPre.date)}.</div>)}
//             <div className="swap-buttons">
//               <button className="btn-accept" disabled={!targetShiftId || !!conflictPre} onClick={submitSwap}>Submit Swap</button>
//               <button className="btn-decline" onClick={() => setSwapModal({ open:false, requesterShiftId:null })}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



//----------------------------------------


// src/pages/Coverages.js
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import './Coverages.css';

// --- Helper Functions to get the current week ---
const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const getEndOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + 7;
    return new Date(d.setDate(diff));
};

const toISODateString = (date) => {
    return date.toISOString().split('T')[0];
};


export default function Coverages() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();

  // --- NEW: State for the date filters ---
  const [dateFilter, setDateFilter] = useState({
      startDate: toISODateString(getStartOfWeek(new Date())),
      endDate: toISODateString(getEndOfWeek(new Date()))
  });

  // Data
  const [myShifts, setMyShifts]           = useState([]);
  const [pendingCov, setPendingCov]     = useState([]);
  const [pendingSwaps, setPendingSwaps] = useState([]);
  const [candidates, setCandidates]     = useState({});

  // Loading & errors
  const [loading, setLoading] = useState({ my:true, cov:true, swaps:true });
  const [errorMsg, setErrorMsg] = useState('');

  // Swap modal state
  const [swapModal, setSwapModal] = useState({
    open: false,
    requesterShiftId: null
  });
  const [chosenOfficer, setChosenOfficer] = useState('');
  const [theirShifts, setTheirShifts]   = useState([]);
  const [targetShiftId, setTargetShiftId] = useState('');
  const [conflictPre, setConflictPre]     = useState(null);

  const fmtDate = iso => new Date(iso).toLocaleDateString();
  const fmtTime = t   => t.slice(0,5);

  // --- UPDATED: `loadMy` function now accepts date filters ---
  const loadMy = useCallback(async () => {
    setLoading(l => ({ ...l, my: true }));
    try {
      // Pass the dates as query parameters to the backend
      const { data } = await api.get('/api/shifts/me', {
          params: {
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate
          }
      });
      setMyShifts(data);
    } catch (e) {
      if (e.response?.status===401) logout();
    } finally {
      setLoading(l => ({ ...l, my: false }));
    }
  }, [logout, dateFilter]); // Dependency array now includes dateFilter

  const loadCov = useCallback(async () => {
    setLoading(l => ({ ...l, cov: true }));
    try {
      const { data } = await api.get('/api/shifts/coverage-requests/pending');
      setPendingCov(data.filter(r => r.requester_officer !== user.username));
    } catch (e) {
      if (e.response?.status===401) logout();
    } finally {
      setLoading(l => ({ ...l, cov: false }));
    }
  }, [logout, user.username]);

  const loadSwaps = useCallback(async () => {
    setLoading(l => ({ ...l, swaps: true }));
    try {
      const { data } = await api.get('/api/shifts/swap-requests/pending');
      setPendingSwaps(data);
    } catch (e) {
      if (e.response?.status===401) logout();
    } finally {
      setLoading(l => ({ ...l, swaps: false }));
    }
  }, [logout]);

  useEffect(() => {
    loadMy(); 
    loadCov(); 
    loadSwaps();
  }, [loadMy, loadCov, loadSwaps]);

  // Handlers... (no changes to functionality)
  const requestCoverage = async id => {
    setErrorMsg('');
    try {
      await api.post('/api/shifts/coverage-request', { shiftId: id });
      addNotification({ title:'Coverage Requested' });
      loadMy(); loadCov();
    } catch (e) { console.error(e); }
  };
  const acceptCoverage = async id => {
    setErrorMsg('');
    try {
      await api.post('/api/shifts/coverage-accept', { shiftId: id });
      loadMy(); loadCov();
    } catch (e) { if (e.response?.status===409) setErrorMsg('⚠️ Overlap detected. Cannot accept.'); }
  };
  const openSwap = async id => {
    setSwapModal({ open:true, requesterShiftId: id });
    setChosenOfficer(''); setTheirShifts([]); setTargetShiftId('');
    setConflictPre(null);
    try {
      const { data } = await api.get(`/api/shifts/swaps/${id}/candidates`);
      setCandidates(data);
    } catch (e) { console.error(e); }
  };
  useEffect(() => {
    setTheirShifts(chosenOfficer ? candidates[chosenOfficer] || [] : []);
  }, [chosenOfficer, candidates]);
  useEffect(() => {
    if (!targetShiftId) { setConflictPre(null); return; }
    const s = theirShifts.find(x => x.shift_id === Number(targetShiftId));
    if (!s) return;
    const conflict = myShifts.find(my => my.id !== swapModal.requesterShiftId && my.date === s.date && !(my.end_time <= s.start_time || my.start_time >= s.end_time));
    setConflictPre(conflict || null);
  }, [targetShiftId, theirShifts, myShifts, swapModal.requesterShiftId]);
  const submitSwap = async () => {
    setErrorMsg('');
    const payload = { requester_shift_id: swapModal.requesterShiftId, target_shift_id: Number(targetShiftId) };
    try {
      await api.post('/api/shifts/swap-request', payload);
      addNotification({ title:'Swap Requested' });
      setSwapModal({ open:false, requesterShiftId:null });
      loadSwaps();
    } catch (e) { setErrorMsg(e.response?.data?.error || 'Unexpected error'); }
  };
  const respondSwap = async (reqId, action) => {
    setErrorMsg('');
    try {
      await api.post(`/api/shifts/swap-requests/${reqId}/respond`, { action });
      loadSwaps(); loadMy();
    } catch (e) { setErrorMsg(e.response?.data?.error || 'Swap conflict—cannot accept.'); }
  };

  const handleDateChange = (e) => {
      setDateFilter(prev => ({
          ...prev,
          [e.target.name]: e.target.value
      }));
  };

  return (
    <div className="coverages-container">
      <h1>Coverage & Swap Management</h1>
      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <section className="coverages-section">
        <div className="section-header">
            <h2>My Shifts</h2>
            <div className="date-filters">
                <div className="filter-group">
                    <label htmlFor="startDate">From:</label>
                    <input type="date" id="startDate" name="startDate" value={dateFilter.startDate} onChange={handleDateChange} />
                </div>
                <div className="filter-group">
                    <label htmlFor="endDate">To:</label>
                    <input type="date" id="endDate" name="endDate" value={dateFilter.endDate} onChange={handleDateChange} />
                </div>
            </div>
        </div>
        {loading.my
          ? <p className="loading-text">Loading…</p>
          : !myShifts.length
            ? <p className="loading-text">No shifts found for this date range.</p>
            : (
              // --- UPDATED: Wrapped in a scrollable div ---
              <div className="scrollable-list">
                <ul className="coverages-list">
                  {myShifts.map(s => (
                    <li key={s.id}>
                      <div className="info">
                        <span className="shift-title">{s.shift_type}</span>
                        <span className="shift-details">
                          {fmtDate(s.date)} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
                        </span>
                      </div>
                      <div className="actions">
                        {s.status === 'requested'
                          ? <span className="badge">Requested</span>
                          : <button
                              className="btn-cover"
                              onClick={() => requestCoverage(s.id)}
                            >
                              Request
                            </button>}
                        {s.status === 'assigned' && (
                          <button
                            className="btn-swap"
                            onClick={() => openSwap(s.id)}
                          >
                            Swap
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </section>

      <section className="coverages-section">
        <h2>Pending Coverage Requests</h2>
        {loading.cov
          ? <p className="loading-text">Loading…</p>
          : !pendingCov.length
            ? <p className="loading-text">No pending coverage.</p>
            : (
              // --- UPDATED: Wrapped in a scrollable div ---
              <div className="scrollable-list">
                <ul className="coverages-list">
                  {pendingCov.map(r => (
                    <li key={r.request_id}>
                      <div className="info">
                        <span className="shift-title">{r.shift_type}</span>
                        <span className="shift-details">
                          {fmtDate(r.date)} ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})
                        </span>
                        <span className="shift-requester">Requested by {r.requester_officer}</span>
                      </div>
                      <div className="actions">
                        <button
                          className="btn-accept"
                          onClick={() => acceptCoverage(r.shift_id)}
                        >
                          Accept
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </section>

      <section className="coverages-section">
        <h2>Pending Swap Requests</h2>
        {loading.swaps
          ? <p className="loading-text">Loading…</p>
          : !pendingSwaps.length
            ? <p className="loading-text">No pending swaps.</p>
            : (
              // --- UPDATED: Wrapped in a scrollable div ---
              <div className="scrollable-list">
                <ul className="coverages-list">
                  {pendingSwaps.map(r => (
                    <li key={r.request_id}>
                      <div className="info">
                          <span className="shift-requester">{r.requester_officer} requests a swap:</span>
                          <span className="shift-details">
                              <strong>Their {r.requester_shift.shift_type}</strong> for <strong>Your {r.target_shift.shift_type}</strong>
                          </span>
                      </div>
                      <div className="actions">
                        <button
                          className="btn-accept"
                          onClick={() => respondSwap(r.request_id, 'accept')}
                        >
                          Accept
                        </button>
                        <button
                          className="btn-decline"
                          onClick={() => respondSwap(r.request_id, 'decline')}
                        >
                          Decline
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
      </section>

      {swapModal.open && (
        <div className="swap-modal">
          <div className="swap-content">
            <h3>Swap Shift</h3>
            <label htmlFor="officer-select">Choose officer:</label>
            <select id="officer-select" value={chosenOfficer} onChange={e => setChosenOfficer(e.target.value)}>
              <option value="">— select person —</option>
              {Object.keys(candidates).map(off => (<option key={off} value={off}>{off}</option>))}
            </select>
            <label htmlFor="shift-select">Select their shift:</label>
            <select id="shift-select" value={targetShiftId} onChange={e => setTargetShiftId(e.target.value)} disabled={!chosenOfficer}>
              <option value="">— select shift —</option>
              {theirShifts.map(s => (<option key={s.shift_id} value={s.shift_id}>{s.shift_type} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})</option>))}
            </select>
            {conflictPre && (<div className="error-message" style={{ marginTop:'0.5rem' }}>⚠️ Conflict with your “{conflictPre.shift_type}” on {fmtDate(conflictPre.date)}.</div>)}
            <div className="swap-buttons">
              <button className="btn-accept" disabled={!targetShiftId || !!conflictPre} onClick={submitSwap}>Submit Swap</button>
              <button className="btn-decline" onClick={() => setSwapModal({ open:false, requesterShiftId:null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
