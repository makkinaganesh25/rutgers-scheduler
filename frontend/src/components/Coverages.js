import React, { useState, useEffect, useContext } from 'react';
import './Coverages.css';
import { AuthContext } from '../contexts/AuthContext';

export default function Coverages() {
  const { user } = useContext(AuthContext);
  const [myShifts, setMyShifts] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1) Fetch my shifts
  useEffect(() => {
    const fetchShifts = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:50001/api/shifts/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMyShifts(data);
    };
    fetchShifts();
  }, []);

  // 2) Fetch all pending coverage requests
  useEffect(() => {
    const fetchPending = async () => {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:50001/api/shifts/coverage-requests/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPending(data);
      setLoading(false);
    };
    fetchPending();
  }, []);

  const requestCoverage = async (shiftId) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:50001/api/shifts/coverage-request', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shiftId, requester_officer: user.username })
    });
    // Refresh pending & myShifts if desired...
  };

  const acceptCoverage = async (shiftId) => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:50001/api/shifts/coverage-accept', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ shiftId, acceptingOfficer: user.username })
    });
    // Refresh pending
    setPending(p => p.filter(req => req.shift_id !== shiftId));
  };

  return (
    <div className="coverages-container">
      <h1>Coverage Management</h1>

      <section>
        <h2>My Shifts</h2>
        <ul className="coverages-list">
          {myShifts.map(shift => (
            <li key={shift.id}>
              <span>
                {shift.shift_type} on {shift.date} ({shift.start_time}–{shift.end_time})
              </span>
              {shift.status === 'assigned' && (
                <button onClick={() => requestCoverage(shift.id)}>
                  Request Coverage
                </button>
              )}
              {shift.status !== 'assigned' && (
                <em>({shift.status})</em>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Pending Requests (Accept Below)</h2>
        {loading
          ? <p>Loading…</p>
          : pending.length === 0
            ? <p>No pending requests.</p>
            : (
              <ul className="coverages-list">
                {pending.map(req => (
                  <li key={req.request_id}>
                    <span>
                      {req.shift_type} on {req.date} ({req.start_time}–{req.end_time})<br/>
                      Requested by {req.requester_officer}
                    </span>
                    <button onClick={() => acceptCoverage(req.shift_id)}>
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
