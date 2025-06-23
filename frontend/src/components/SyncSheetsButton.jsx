import React, { useState } from 'react';
import api from '../api';

export default function SyncSheetsButton() {
  const [loading, setLoading] = useState(false);
  const syncAll = async () => {
    setLoading(true);
    try {
      // NOTE: no "/api" prefix here, api.baseURL is already http://localhost:5001
      await api.post('/sheet-sync/full');
      alert('✅ Synced all events to Google Sheets');
    } catch (e) {
      console.error(e);
      alert('❌ Sync failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };
  return (
    <button onClick={syncAll} disabled={loading}>
      {loading ? 'Syncing…' : 'Sync All to Google Sheets'}
    </button>
  );
}
