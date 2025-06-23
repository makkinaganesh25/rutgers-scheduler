// //---------------------------------------------------------------------------
// import React, { useState, useEffect, useCallback } from 'react';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './Coverages.css';

// export default function Coverages() {
//   const { user, logout } = useAuth();
//   const { addNotification } = useNotifications();

//   const [myShifts, setMyShifts]               = useState([]);
//   const [pending, setPending]                 = useState([]);
//   const [loadingMyShifts, setLoadingMyShifts] = useState(true);
//   const [loadingPending, setLoadingPending]   = useState(true);
//   const [conflictMsg, setConflictMsg]         = useState('');

//   const fmtDate = iso => new Date(iso).toLocaleDateString();
//   const fmtTime = t   => t.slice(0,5);

//   const loadMyShifts = useCallback(async () => {
//     setLoadingMyShifts(true);
//     try {
//       const { data } = await api.get('/api/shifts/me');
//       setMyShifts(data);
//     } catch (err) {
//       if (err.response?.status === 401) logout();
//       console.error(err);
//     } finally {
//       setLoadingMyShifts(false);
//     }
//   }, [logout]);

//   const loadPending = useCallback(async () => {
//     setLoadingPending(true);
//     try {
//       const { data } = await api.get('/api/shifts/coverage-requests/pending');
//       setPending(data.filter(r => r.requester_officer !== user.username));
//     } catch (err) {
//       if (err.response?.status === 401) logout();
//       console.error(err);
//     } finally {
//       setLoadingPending(false);
//     }
//   }, [logout, user.username]);

//   const requestCoverage = async shiftId => {
//     setConflictMsg('');
//     try {
//       await api.post('/api/shifts/coverage-request', { shiftId });
//       const shift = myShifts.find(s => s.id === shiftId);
//       addNotification({
//         title: 'Coverage Requested',
//         body: `${user.username} requested coverage for "${shift.shift_type}" on ${fmtDate(shift.date)} (${fmtTime(shift.start_time)}–${fmtTime(shift.end_time)})`
//       });
//       await Promise.all([loadMyShifts(), loadPending()]);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const acceptCoverage = async shiftId => {
//     setConflictMsg('');
//     try {
//       await api.post('/api/shifts/coverage-accept', { shiftId });
//       await Promise.all([loadMyShifts(), loadPending()]);
//     } catch (err) {
//       if (err.response?.status === 409 && err.response.data.error === 'Overlapping shift') {
//         const c = err.response.data.conflict;
//         setConflictMsg(
//           `⚠️ You already have "${c.shift_type}" on ${fmtDate(c.shift_date)} from ${fmtTime(c.shift_start)} to ${fmtTime(c.shift_end)}.`
//         );
//       } else {
//         console.error(err.response?.data || err);
//       }
//     }
//   };

//   useEffect(() => {
//     loadMyShifts();
//     loadPending();
//   }, [loadMyShifts, loadPending]);

//   return (
//     <div className="coverages-container">
//       <h1>Coverage Management</h1>

//       {conflictMsg && (
//         <div className="error-message">{conflictMsg}</div>
//       )}

//       <section>
//         <h2>My Shifts</h2>
//         {loadingMyShifts ? (
//           <p>Loading your shifts…</p>
//         ) : myShifts.length === 0 ? (
//           <p>No shifts.</p>
//         ) : (
//           <ul className="coverages-list">
//             {myShifts.map(s => (
//               <li key={s.id}>
//                 <span>
//                   {s.shift_type} on {fmtDate(s.date)} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
//                 </span>
//                 {s.status === 'requested' ? (
//                   <span className="badge requested">Requested</span>
//                 ) : (
//                   <button onClick={() => requestCoverage(s.id)}>
//                     Request Coverage
//                   </button>
//                 )}
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>

//       <section style={{ marginTop: '2rem' }}>
//         <h2>Pending Requests</h2>
//         {loadingPending ? (
//           <p>Loading pending…</p>
//         ) : pending.length === 0 ? (
//           <p>No pending requests.</p>
//         ) : (
//           <ul className="coverages-list">
//             {pending.map(r => (
//               <li key={r.request_id}>
//                 <span>
//                   {r.shift_type} on {fmtDate(r.date)} ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})<br/>
//                   Requested by {r.requester_officer}
//                 </span>
//                 <button onClick={() => acceptCoverage(r.shift_id)}>
//                   Accept
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </section>
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationsContext';
import './Coverages.css';

export default function Coverages() {
  const { user, logout } = useAuth();
  const { addNotification } = useNotifications();

  // Data
  const [myShifts, setMyShifts]         = useState([]);
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
  const [theirShifts, setTheirShifts]     = useState([]);
  const [targetShiftId, setTargetShiftId] = useState('');
  const [conflictPre, setConflictPre]     = useState(null);

  const fmtDate = iso => new Date(iso).toLocaleDateString();
  const fmtTime = t   => t.slice(0,5);

  // Loaders
  const loadMy = useCallback(async () => {
    setLoading(l => ({ ...l, my: true }));
    try {
      const { data } = await api.get('/api/shifts/me');
      setMyShifts(data);
    } catch (e) {
      if (e.response?.status===401) logout();
    } finally {
      setLoading(l => ({ ...l, my: false }));
    }
  }, [logout]);

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
    loadMy(); loadCov(); loadSwaps();
  }, [loadMy, loadCov, loadSwaps]);

  // Coverage handlers
  const requestCoverage = async id => {
    setErrorMsg('');
    try {
      await api.post('/api/shifts/coverage-request', { shiftId: id });
      addNotification({ title:'Coverage Requested' });
      loadMy(); loadCov();
    } catch (e) {
      console.error(e);
    }
  };
  const acceptCoverage = async id => {
    setErrorMsg('');
    try {
      await api.post('/api/shifts/coverage-accept', { shiftId: id });
      loadMy(); loadCov();
    } catch (e) {
      if (e.response?.status===409) {
        setErrorMsg('⚠️ Overlap detected. Cannot accept.');
      }
    }
  };

  // Open swap modal
  const openSwap = async id => {
    setSwapModal({ open:true, requesterShiftId: id });
    setChosenOfficer(''); setTheirShifts([]); setTargetShiftId('');
    setConflictPre(null);
    try {
      const { data } = await api.get(`/api/shifts/swaps/${id}/candidates`);
      setCandidates(data);
    } catch (e) {
      console.error(e);
    }
  };

  // When officer chosen
  useEffect(() => {
    setTheirShifts(
      chosenOfficer ? candidates[chosenOfficer] || [] : []
    );
  }, [chosenOfficer, candidates]);

  // Pre‐check conflict
  useEffect(() => {
    if (!targetShiftId) {
      setConflictPre(null);
      return;
    }
    const s = theirShifts.find(x => x.shift_id === Number(targetShiftId));
    if (!s) return;

    const conflict = myShifts.find(my =>
      my.id !== swapModal.requesterShiftId &&
      my.date === s.date &&
      !(my.end_time <= s.start_time || my.start_time >= s.end_time)
    );
    setConflictPre(conflict || null);
  }, [
    targetShiftId,
    theirShifts,
    myShifts,
    swapModal.requesterShiftId
  ]);

  // Submit swap
  const submitSwap = async () => {
    setErrorMsg('');
    const payload = {
      requester_shift_id: swapModal.requesterShiftId,
      target_shift_id:    Number(targetShiftId)
    };
    try {
      await api.post('/api/shifts/swap-request', payload);
      addNotification({ title:'Swap Requested' });
      setSwapModal({ open:false, requesterShiftId:null });
      loadSwaps();
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Unexpected error');
    }
  };

  // Respond to swap
  const respondSwap = async (reqId, action) => {
    setErrorMsg('');
    try {
      await api.post(`/api/shifts/swap-requests/${reqId}/respond`, { action });
      loadSwaps(); loadMy();
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Swap conflict—cannot accept.');
    }
  };

  return (
    <div className="coverages-container">
      <h1>Coverage & Swap Management</h1>
      {errorMsg && <div className="error-message">{errorMsg}</div>}

      {/* My Shifts */}
      <section className="coverages-section">
        <h2>My Shifts</h2>
        {loading.my
          ? <p>Loading…</p>
          : !myShifts.length
            ? <p>No shifts.</p>
            : (
              <ul className="coverages-list">
                {myShifts.map(s => (
                  <li key={s.id}>
                    <div className="info">
                      {s.shift_type} on {fmtDate(s.date)}
                      ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
                    </div>
                    <div className="actions">
                      {s.status === 'requested'
                        ? <span className="badge">Requested</span>
                        : <button
                            className="btn-cover"
                            onClick={() => requestCoverage(s.id)}
                          >
                            Request Coverage
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
            )}
      </section>

      {/* Pending Coverage */}
      <section className="coverages-section">
        <h2>Pending Coverage Requests</h2>
        {loading.cov
          ? <p>Loading…</p>
          : !pendingCov.length
            ? <p>No pending coverage.</p>
            : (
              <ul className="coverages-list">
                {pendingCov.map(r => (
                  <li key={r.request_id}>
                    <div className="info">
                      {r.shift_type} on {fmtDate(r.date)}
                      ({fmtTime(r.start_time)}–{fmtTime(r.end_time)})<br/>
                      Requested by {r.requester_officer}
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
            )}
      </section>

      {/* Pending Swaps */}
      <section className="coverages-section">
        <h2>Pending Swap Requests</h2>
        {loading.swaps
          ? <p>Loading…</p>
          : !pendingSwaps.length
            ? <p>No pending swaps.</p>
            : (
              <ul className="coverages-list">
                {pendingSwaps.map(r => (
                  <li key={r.request_id}>
                    <div className="info">
                      {r.requester_officer} wants{' '}
                      <strong>{r.requester_shift.shift_type}</strong>{' '}
                      ({fmtTime(r.requester_shift.start_time)}–{fmtTime(r.requester_shift.end_time)}){' '}
                      for your <strong>{r.target_shift.shift_type}</strong>
                    </div>
                    <div className="actions">
                      <button
                        className="btn-accept"
                        onClick={() => respondSwap(r.request_id, 'accept')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-swap"
                        onClick={() => respondSwap(r.request_id, 'decline')}
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
      </section>

      {/* Swap Modal */}
      {swapModal.open && (
        <div className="swap-modal">
          <div className="swap-content">
            <h3>Swap Shift #{swapModal.requesterShiftId}</h3>

            <label>Choose officer:</label>
            <select
              value={chosenOfficer}
              onChange={e => setChosenOfficer(e.target.value)}
            >
              <option value="">— select person —</option>
              {Object.keys(candidates).map(off => (
                <option key={off} value={off}>{off}</option>
              ))}
            </select>

            <label>Select their shift:</label>
            <select
              value={targetShiftId}
              onChange={e => setTargetShiftId(e.target.value)}
              disabled={!chosenOfficer}
            >
              <option value="">— select shift —</option>
              {theirShifts.map(s => (
                <option key={s.shift_id} value={s.shift_id}>
                  {s.shift_type} ({fmtTime(s.start_time)}–{fmtTime(s.end_time)})
                </option>
              ))}
            </select>

            {conflictPre && (
              <div className="error-message" style={{ marginTop:'0.5rem' }}>
                ⚠️ Conflict with your “{conflictPre.shift_type}” on {fmtDate(conflictPre.date)}.
              </div>
            )}

            <div className="swap-buttons">
              <button
                className="btn-accept"
                disabled={!targetShiftId || !!conflictPre}
                onClick={submitSwap}
              >
                Submit Swap
              </button>
              <button
                className="btn-swap"
                onClick={() => setSwapModal({ open:false, requesterShiftId:null })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
