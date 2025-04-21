import React, { useState, useEffect, useContext } from 'react';
import './Coverages.css';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

// Hard‑code the exact address your Express server is on:
const API_BASE = 'http://localhost:50001/api/shifts';

export default function Coverages() {
  const { user } = useContext(AuthContext);

  const [myShifts, setMyShifts]               = useState([]);
  const [pending, setPending]                 = useState([]);
  const [loadingMyShifts, setLoadingMyShifts] = useState(true);
  const [loadingPending, setLoadingPending]   = useState(true);

  const parseLocal = (d, t) => {
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    const [h, mi]     = t.split(':').map(Number);
    return new Date(y, m - 1, day, h, mi);
  };

  // 1) Load this user’s shifts
  const loadMyShifts = async () => {
    setLoadingMyShifts(true);
    try {
      const token = localStorage.getItem('token');
      const resp  = await axios.get(
        `${API_BASE}/me`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMyShifts(resp.data);
    } catch (err) {
      console.error('loadMyShifts error', err);
      setMyShifts([]);
    } finally {
      setLoadingMyShifts(false);
    }
  };

  // 2) Load pending requests
  const loadPending = async () => {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem('token');
      const resp  = await axios.get(
        `${API_BASE}/coverage-requests/pending`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPending(resp.data);
    } catch (err) {
      console.error('loadPending error', err);
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  };

  // 3) Request coverage
  const requestCoverage = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const resp  = await axios.post(
        `${API_BASE}/coverage-request`,
        { shiftId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('requestCoverage success', resp.data);
      await loadMyShifts();
    } catch (err) {
      console.error('requestCoverage failed', err.response?.data || err);
    }
  };

  // 4) Accept coverage
  const acceptCoverage = async (shiftId) => {
    try {
      const token = localStorage.getItem('token');
      const resp  = await axios.post(
        `${API_BASE}/coverage-accept`,
        { shiftId, acceptingOfficer: user.username },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('acceptCoverage success', resp.data);
      setPending(p => p.filter(r => r.shift_id !== shiftId));
      await loadMyShifts();
    } catch (err) {
      console.error('acceptCoverage failed', err.response?.data || err);
    }
  };

  useEffect(() => {
    loadMyShifts();
    loadPending();
  }, []);

  const now      = new Date();
  const upcoming = myShifts.filter(s => parseLocal(s.date, s.start_time) > now);

  return (
    <div className="coverages-container">
      <h1>Coverage Management</h1>

      <section>
        <h2>My Upcoming Shifts</h2>
        {loadingMyShifts
          ? <p>Loading your shifts…</p>
          : upcoming.length === 0
            ? <p>No upcoming shifts.</p>
            : (
              <ul className="coverages-list">
                {upcoming.map(s => (
                  <li key={s.id}>
                    <span>
                      {s.shift_type} on {s.date.slice(0,10)} ({s.start_time}–{s.end_time})
                    </span>
                    {s.status === 'requested'
                      ? <span className="badge requested">Requested</span>
                      : <button onClick={() => requestCoverage(s.id)}>
                          Request Coverage
                        </button>
                    }
                  </li>
                ))}
              </ul>
            )
        }
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Pending Requests</h2>
        {loadingPending
          ? <p>Loading pending requests…</p>
          : pending.length === 0
            ? <p>No pending requests.</p>
            : (
              <ul className="coverages-list">
                {pending.map(r => (
                  <li key={r.request_id}>
                    <span>
                      {r.shift_type} on {r.date.slice(0,10)} ({r.start_time}–{r.end_time})<br/>
                      Requested by {r.requester_officer}
                    </span>
                    <button onClick={() => acceptCoverage(r.shift_id)}>
                      Accept
                    </button>
                  </li>
                ))}
              </ul>
            )
        }
      </section>
    </div>
  );
}
