// src/api/sheets.js
import api from '../api';

// fetch the sheet data
export function fetchSheet() { 
    return api.get('/api/sheets');
}

export function updateSheet(rows) {
    return api.post('/api/sheets/update', { rows });
}
    
// push updates back to Google Sheets
// export function updateSheet(rows) { return api.post('/sheets/update', { rows }); }

