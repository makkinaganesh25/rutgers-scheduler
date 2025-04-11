// src/pages/ShiftList.js
import React, { useState, useEffect } from 'react';
import { getShifts, requestCoverage, acceptCoverage } from '../api';

const ShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch shifts on component mount
  useEffect(() => {
    fetchShifts();
  }, []);

  const fetchShifts = async () => {
    try {
      const data = await getShifts();
      setShifts(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRequestCoverage = async (shiftId) => {
    try {
      // For now, hard-code the requesting officer name
      const result = await requestCoverage(shiftId, 'CDT Makkina');
      setMessage(result.message);
      setError(null);
      // Refresh shifts
      await fetchShifts();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAcceptCoverage = async (shiftId) => {
    try {
      // For now, hard-code the accepting officer name
      const result = await acceptCoverage(shiftId, 'Officer B');
      setMessage(result.message);
      setError(null);
      // Refresh shifts
      await fetchShifts();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading shifts...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Shifts</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="5" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Shift Type</th>
            <th>Date</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Role</th>
            <th>Officer</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shifts.map((shift) => (
            <tr key={shift.id}>
              <td>{shift.id}</td>
              <td>{shift.shift_type}</td>
              <td>{shift.date}</td>
              <td>{shift.start_time}</td>
              <td>{shift.end_time}</td>
              <td>{shift.role}</td>
              <td>{shift.officer_name || '-'}</td>
              <td>{shift.status}</td>
              <td>
                {shift.status === 'open' && (
                  <button onClick={() => handleRequestCoverage(shift.id)}>
                    Request Coverage
                  </button>
                )}
                {shift.status === 'requested' && (
                  <button onClick={() => handleAcceptCoverage(shift.id)}>
                    Accept Coverage
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShiftList;
// src/pages/ShiftList.js