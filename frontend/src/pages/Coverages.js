// src/pages/Coverages.js
import React, { useState, useEffect, useContext } from 'react';
import './Coverages.css';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';

const API_BASE = 'http://localhost:50001/api/shifts';

export default function Coverages() {
  const { user } = useContext(AuthContext);

  const [myShifts, setMyShifts]               = useState([]);
  const [pending, setPending]                 = useState([]);
  const [loadingMyShifts, setLoadingMyShifts] = useState(true);
  const [loadingPending, setLoadingPending]   = useState(true);
  const [conflictMsg, setConflictMsg]         = useState('');

  const parseLocal = (d, t) => {
    const [y, m, day] = d.split('T')[0].split('-').map(Number);
    const [h, mi]     = t.split(':').map(Number);
    return new Date(y, m - 1, day, h, mi);
  };

  async function loadMyShifts() {
    setLoadingMyShifts(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyShifts(data);
    } catch {
      setMyShifts([]);
    } finally {
      setLoadingMyShifts(false);
    }
  }

  async function loadPending() {
    setLoadingPending(true);
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_BASE}/coverage-requests/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(data);
    } catch {
      setPending([]);
    } finally {
      setLoadingPending(false);
    }
  }

  async function requestCoverage(shiftId) {
    setConflictMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/coverage-request`,
        { shiftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Promise.all([loadMyShifts(), loadPending()]);
    } catch (e) {
      console.error(e.response?.data || e);
    }
  }

  async function acceptCoverage(shiftId) {
    setConflictMsg('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE}/coverage-accept`,
        { shiftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Promise.all([loadMyShifts(), loadPending()]);
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data.error === 'Overlapping shift') {
        const c = data.conflict;
        setConflictMsg(
          `⚠️ You already have a “${c.shift_type}” shift on ${c.shift_date} ` +
          `from ${c.shift_start} to ${c.shift_end}.`
        );
      } else {
        console.error(data || err);
      }
    }
  }

  useEffect(() => {
    loadMyShifts();
    loadPending();
  }, []);

  const now      = new Date();
  const upcoming = myShifts.filter(s => parseLocal(s.date, s.start_time) > now);

  return (
    <div className="coverages-container">
      <h1>Coverage Management</h1>

      {conflictMsg && (
        <div className="error-message" style={{ color: 'crimson', marginBottom: '1rem' }}>
          {conflictMsg}
        </div>
      )}

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
