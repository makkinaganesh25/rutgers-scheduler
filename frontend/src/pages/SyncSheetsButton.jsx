// src/components/SyncSheetsButton.jsx
import React, { useState } from 'react';
import api from '../api';

export default function SyncSheetsButton() {
  const [loading, setLoading] = useState(false);
  const doSync = async () => {
    setLoading(true);
    try {
      await api.post('/sheet-sync/full');
      alert('✅ Synced all events to Google Sheets');
    } catch (e) {
      alert(`❌ Sync failed: ${e.response?.data?.error || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={doSync} disabled={loading}>
      {loading ? 'Syncing…' : 'Sync All to Google Sheets'}
    </button>
  );
}
