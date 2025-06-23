import React, { useState, useEffect } from 'react';
import { applySecurityLeave, listMySecurityLeave } from '../api';
import { format } from 'date-fns';
import './SecurityLeaveRequest.css';

export default function SecurityLeaveRequest() {
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');
  const [requests,  setRequests]  = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setError('');
    try {
      const data = await listMySecurityLeave();
      setRequests(data);
    } catch {
      setError('Could not load your leave requests.');
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate) {
      setError('Please pick both a start and end date.');
      return;
    }

    try {
      await applySecurityLeave({ start_date: startDate, end_date: endDate });
      setSuccess('Leave requested successfully!');
      setStartDate('');
      setEndDate('');
      loadRequests();
    } catch {
      setError('Failed to submit leave request.');
    }
  }

  return (
    <div className="request-page">
      <h2>Request Security-Officer Leave</h2>

      {error && <div className="request-error">{error}</div>}
      {success && <div className="request-success">{success}</div>}

      <form className="request-form" onSubmit={onSubmit}>
        <label>
          From
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
          />
        </label>

        <label>
          To
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            required
          />
        </label>

        <button type="submit">Submit Leave Request</button>
      </form>

      <h3>My Leave Requests</h3>
      <table className="request-table">
        <thead>
          <tr>
            <th>From</th>
            <th>To</th>
            <th>Status</th>
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
  );
}
