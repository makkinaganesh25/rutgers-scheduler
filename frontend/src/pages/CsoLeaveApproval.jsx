import React, { useEffect, useState } from 'react';
import { listAllCsoLeave, updateCsoLeave } from '../api';
import { format } from 'date-fns';
import './CsoLeaveApproval.css';

export default function CsoLeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [error,    setError]    = useState('');

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
      fetchAll();
    } catch {
      setError('Failed to update request.');
    }
  }

  return (
    <div className="approval-page">
      <div className="card">
        <h2>Approve CSO Leave</h2>
        {error && <div className="alert error">{error}</div>}

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
            {requests.map(r => (
              <tr key={r.id}>
                <td>{r.username}</td>
                <td>{format(new Date(r.start_date), 'MM/dd/yyyy')}</td>
                <td>{format(new Date(r.end_date),   'MM/dd/yyyy')}</td>
                <td className={`status ${r.status}`}>{r.status}</td>
                <td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
