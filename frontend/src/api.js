
// src/api.js
const API_BASE = 'http://localhost:50001'; // Ensure this matches your backend port

export async function getShifts() {
  const response = await fetch(`${API_BASE}/api/shifts`);
  if (!response.ok) throw new Error('Failed to fetch shifts');
  return response.json();
}

export async function requestCoverage(shiftId, requester_officer) {
  const response = await fetch(`${API_BASE}/api/shifts/coverage-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shiftId, requester_officer }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Coverage request failed');
  }
  return response.json();
}

export async function acceptCoverage(shiftId, acceptingOfficer) {
  const response = await fetch(`${API_BASE}/api/shifts/coverage-accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shiftId, acceptingOfficer }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Coverage acceptance failed');
  }
  return response.json();
}
