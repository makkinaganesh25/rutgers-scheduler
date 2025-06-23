// src/pages/LiveSheets.jsx
import React, { useEffect, useState } from 'react';
import { fetchSheet, updateSheet } from '../api/sheets';
import './LiveSheets.css';

export default function LiveSheets() {
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSheet()
      .then(res => {
        console.log('📄 /api/sheets response:', res.data);
        setColumns(res.data.columns || []);
        setRows(res.data.rows || []);
      })
      .catch(err => {
        console.error('Error fetching sheet:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCellChange = (rIdx, cIdx, value) => {
    const updated = [...rows];
    updated[rIdx][columns[cIdx]] = value;
    setRows(updated);
  };

  const handleSave = () => {
    updateSheet(rows)
      .then(() => alert('✅ Saved successfully!'))
      .catch(err => {
        console.error('Error saving sheet:', err);
        alert('❌ Save failed: ' + (err.message || 'Unknown error'));
      });
  };

  if (loading) {
    return <div className="sheets-loading">Loading LiveSheets…</div>;
  }

  if (error) {
    return <div className="sheets-error">Error: {error}</div>;
  }

  return (
    <div className="sheets-container">
      <h1>LiveSheets</h1>
      <button className="sheets-save-btn" onClick={handleSave}>
        Save Changes
      </button>

      <div className="sheets-table-wrapper">
        <table className="sheets-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '1rem' }}>
                  No data to display.
                </td>
              </tr>
            ) : (
              rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {columns.map((col, cIdx) => (
                    <td key={col}>
                      <input
                        value={row[col] || ''}
                        onChange={e => handleCellChange(rIdx, cIdx, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
