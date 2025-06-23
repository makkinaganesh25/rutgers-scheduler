import React, { useEffect, useState } from 'react';
import { listAllSecurityLeave, updateSecurityLeave } from '../api';
import { format } from 'date-fns';
import './SecurityLeaveApproval.css';

export default function SecurityLeaveApproval() {
  const [requests, setRequests] = useState([]);
  const [error,    setError]    = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setError('');
    try {
      const data = await listAllSecurityLeave();
      setRequests(data);
    } catch {
      setError('Could not load leave requests.');
    }
  }

  async function decide(id, status) {
    setError('');
    try {
      await updateSecurityLeave(id, status);
      fetchAll();
    } catch {
      setError('Failed to update request.');
    }
  }

  return (
    <div className="approval-page">
      <h2>Approve Security-Officer Leave</h2>
      {error && <div className="approval-error">{error}</div>}

      <table className="approval-table">
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
              <td>{r.first_name || r.username}</td>
              <td>{format(new Date(r.start_date), 'MM/dd/yyyy')}</td>
              <td>{format(new Date(r.end_date),   'MM/dd/yyyy')}</td>
              <td>{r.status}</td>
              <td className="approval-actions">
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => decide(r.id, 'approved')}>
                      Approve
                    </button>
                    <button onClick={() => decide(r.id, 'denied')}>
                      Deny
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
