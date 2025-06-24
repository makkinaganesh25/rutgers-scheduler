import React, { useEffect, useState, useMemo } from 'react';
import { listAllCsoLeave, updateCsoLeave } from '../api';
import { format } from 'date-fns';
import './CsoLeaveApproval.css';

export default function CsoLeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [view, setView] = useState('active'); // 'active' or 'archived'

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setError('');
    try {
      const data = await listAllCsoLeave();
      setRequests(data);
    } catch {
      setError('Could not load leave requests.');
    }
  }

  async function decide(id, status) {
    setError('');
    try {
      await updateCsoLeave(id, status);
      // After updating, refetch all data to get the latest statuses
      fetchAll();
    } catch {
      setError('Failed to update request.');
    }
  }

  // Filter requests into active and archived lists
  const activeRequests = useMemo(() => 
    requests.filter(r => r.status === 'pending'), 
    [requests]
  );

  const archivedRequests = useMemo(() => 
    requests.filter(r => r.status !== 'pending'), 
    [requests]
  );
  
  const displayedRequests = view === 'active' ? activeRequests : archivedRequests;

  return (
    <div className="approval-page">
      <div className="card">
        <h2>Approve CSO Leave</h2>

        {/* --- NEW: View Toggle Buttons --- */}
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${view === 'active' ? 'active' : ''}`}
            onClick={() => setView('active')}
          >
            Active <span className="count-badge">{activeRequests.length}</span>
          </button>
          <button 
            className={`toggle-btn ${view === 'archived' ? 'active' : ''}`}
            onClick={() => setView('archived')}
          >
            Archived
          </button>
        </div>
        {/* --- END NEW --- */}

        {error && <div className="alert error">{error}</div>}

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedRequests.length > 0 ? (
                displayedRequests.map(r => (
                  <tr key={r.id}>
                    <td data-label="Officer">{r.username}</td>
                    <td data-label="From">{format(new Date(r.start_date), 'MM/dd/yyyy')}</td>
                    <td data-label="To">{format(new Date(r.end_date), 'MM/dd/yyyy')}</td>
                    <td data-label="Status" className={`status ${r.status}`}>{r.status}</td>
                    <td data-label="Action">
                      {r.status === 'pending' && (
                        <div className="actions">
                          <button 
                            className="btn-accept" 
                            onClick={() => decide(r.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button 
                            className="btn-deny" 
                            onClick={() => decide(r.id, 'denied')}
                          >
                            Deny
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="no-data-cell">
                    No {view} requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
