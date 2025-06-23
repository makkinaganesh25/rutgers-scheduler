// // File: src/pages/Calendar.jsx
// import React, { useEffect, useState, useContext } from 'react';
// import axios from 'axios';
// import { AuthContext } from '../contexts/AuthContext';
// import './Calendar.css';

// export default function Calendar() {
//   const [shifts, setShifts] = useState([]);
//   const { logout } = useContext(AuthContext);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     axios.get('/api/shifts/me', {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(res => setShifts(res.data))
//     .catch(err => {
//       console.error(err);
//       if (err.response?.status === 401) logout();
//     });
//   }, [logout]);

//   const addShiftToCalendar = s => {
//     const token = localStorage.getItem('token');
//     const params = new URLSearchParams({
//       shiftDate:   s.date,
//       startTime:   s.start_time,
//       endTime:     s.end_time,
//       summary:     `CSO Shift – ${s.shift_type}`,
//       description: s.details || ''
//     }).toString();

//     axios.get(`/api/calendar/auth-url?${params}`, {
//       headers: { Authorization: `Bearer ${token}` }
//     })
//     .then(({ data }) => {
//       window.location.href = data.url;
//     })
//     .catch(err => {
//       console.error('Auth-URL error:', err);
//       alert('Could not connect to Google Calendar');
//     });
//   };

//   return (
//     <div className="calendar-container">
//       <h2>Your Shifts</h2>
//       <div className="calendar-events">
//         {shifts.length > 0 ? shifts.map(s => (
//           <div key={s.id} className="calendar-event shift">
//             <h4>{s.shift_type} on {s.date}</h4>
//             <p>{s.start_time} – {s.end_time}</p>
//             <button onClick={() => addShiftToCalendar(s)}>
//               Add to Google Calendar
//             </button>
//           </div>
//         )) : (
//           <p>No shifts found for your account.</p>
//         )}
//       </div>
//     </div>
//   );
// }
// -------------------------------------------------------------------------------------
// // File: src/pages/Calendar.jsx
// import React, { useEffect, useState } from 'react';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import './Calendar.css';

// export default function Calendar() {
//   const [shifts, setShifts] = useState([]);
//   const { logout } = useAuth();

//   useEffect(() => {
//     api.get('/api/shifts/me')
//       .then(res => setShifts(res.data))
//       .catch(err => {
//         console.error(err);
//         if (err.response?.status === 401) logout();
//       });
//   }, [logout]);

//   const addShiftToCalendar = (s) => {
//     const params = new URLSearchParams({
//       shiftDate:   s.date.slice(0,10),
//       startTime:   s.start_time,
//       endTime:     s.end_time,
//       summary:     `CSO Shift – ${s.shift_type}`,
//       description: s.details || ''
//     }).toString();

//     api.get(`/api/calendar/auth-url?${params}`)
//       .then(({ data }) => {
//         window.location.href = data.url;
//       })
//       .catch(err => {
//         console.error('Auth-URL error:', err);
//         alert('Could not connect to Google Calendar');
//       });
//   };

//   return (
//     <div className="calendar-container">
//       <h2>Your Shifts</h2>
//       <div className="calendar-events">
//         {shifts.length > 0
//           ? shifts.map(s => (
//               <div key={s.id} className="calendar-event shift">
//                 <h4>{s.shift_type} on {s.date.slice(0,10)}</h4>
//                 <p>{s.start_time} – {s.end_time}</p>
//                 <button onClick={() => addShiftToCalendar(s)}>
//                   Add to Google Calendar
//                 </button>
//               </div>
//             ))
//           : <p>No shifts found for your account.</p>
//         }
//       </div>
//     </div>
//   );
// }
// // -------------------------------------------------------------------------------------

// File: src/pages/Calendar.jsx

import React, { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import './Calendar.css';

export default function Calendar() {
  const [shifts, setShifts] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    api.get('/api/shifts/me')
      .then(res => setShifts(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) logout();
      });
  }, [logout]);

  // Only treat YYYY-MM-DD; drop any time or timezone
  const isFuture = s => s.date.slice(0,10) >= new Date().toISOString().slice(0,10);

  const addShiftToCalendar = (s) => {
    const params = new URLSearchParams({
      shiftDate:   s.date.slice(0,10),
      startTime:   s.start_time,
      endTime:     s.end_time,
      summary:     `CSO Shift – ${s.shift_type}`,
      description: s.details || ''
    }).toString();

    api.get(`/api/calendar/auth-url?${params}`)
      .then(({ data }) => {
        window.location.href = data.url;
      })
      .catch(err => {
        console.error('Auth-URL error:', err);
        alert('Could not connect to Google Calendar');
      });
  };

  return (
    <div className="calendar-container">
      <h2>Your Shifts</h2>
      <div className="calendar-events">
        {shifts.length === 0 && <p>No shifts found.</p>}

        {/* Upcoming */}
        {shifts.filter(isFuture).map(s =>
          <div key={s.id} className="calendar-event shift">
            <h4>{s.shift_type} on {s.date.slice(0,10)}</h4>
            <p>{s.start_time} – {s.end_time}</p>
            <button onClick={() => addShiftToCalendar(s)}>
              Add to Google Calendar
            </button>
          </div>
        )}

        {/* Past (optional archive) */}
        {shifts.some(s => !isFuture(s)) && (
          <>
            <h3>Past Shifts</h3>
            {shifts.filter(s => !isFuture(s)).map(s =>
              <div key={s.id} className="calendar-event shift past">
                <h4>{s.shift_type} on {s.date.slice(0,10)}</h4>
                <p>{s.start_time} – {s.end_time}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
