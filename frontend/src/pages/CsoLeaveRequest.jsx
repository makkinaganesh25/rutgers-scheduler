import React, { useState, useEffect } from 'react';
import { applyCsoLeave, listMyCsoLeave } from '../api';
import { format } from 'date-fns';
import './CsoLeaveRequest.css';

export default function CsoLeaveRequest() {
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [requests,  setRequests]  = useState([]);

  useEffect(() => { loadRequests(); }, []);

  async function loadRequests() {
    setError('');
    try {
      const data = await listMyCsoLeave();
      setRequests(data);
    } catch {
      setError('Could not load your leave requests.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!startDate || !endDate) {
      setError('Please select both dates.');
      return;
    }
    try {
      await applyCsoLeave({ start_date: startDate, end_date: endDate });
      setSuccess('Leave requested successfully!');
      setStartDate(''); setEndDate('');
      loadRequests();
    } catch {
      setError('Failed to submit leave request.');
    }
  }

  return (
    <div className="leave-page">
      <div className="card">
        <h2>Request CSO Leave</h2>
        {error   && <div className="alert error">{error}</div>}
        {success && <div className="alert success">{success}</div>}

        <form className="form-grid" onSubmit={handleSubmit}>
          <label>
            From
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-primary">
            Submit Leave Request
          </button>
        </form>
      </div>

      <div className="card table-card">
        <h3>My Leave Requests</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>From</th><th>To</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.id}>
                <td>{format(new Date(r.start_date), 'MM/dd/yyyy')}</td>
                <td>{format(new Date(r.end_date),   'MM/dd/yyyy')}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
