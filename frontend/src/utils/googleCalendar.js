// File: src/utils/googleCalendar.js
import { loadGapiInsideDOM } from 'gapi-script';

// 🔑 Replace with your OAuth Client ID from GCP
const CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const SCOPES   = 'https://www.googleapis.com/auth/calendar.events';

export async function initGapiClient() {
  await loadGapiInsideDOM();
  return window.gapi.load('client:auth2', () =>
    window.gapi.client.init({ clientId: CLIENT_ID, scope: SCOPES })
  );
}

export function signInAndGetToken() {
  const auth = window.gapi.auth2.getAuthInstance();
  return auth.signIn().then(user => user.getAuthResponse().access_token);
}
