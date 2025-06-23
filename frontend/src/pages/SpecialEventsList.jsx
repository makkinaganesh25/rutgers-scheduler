// import React, { useEffect, useState } from 'react';
// import { Link }                         from 'react-router-dom';
// import { listEvents }                   from '../api';
// import './SpecialEventsList.css';

// export default function SpecialEventsList() {
//   const [events, setEvents]   = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     listEvents()
//       .then(data => setEvents(data))
//       .catch(err => {
//         console.error('Failed to load events:', err);
//         alert('Could not load special events.');
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p>Loading events…</p>;
//   if (!events.length) return <p>No special events published yet.</p>;

//   return (
//     <div className="events-list" style={{ padding: 20 }}>
//       <h1>Special Events</h1>
//       <ul>
//         {events.map(ev => (
//           <li key={ev.id}>
//             <Link to={`/events/${ev.id}`}>
//               {ev.name || '(no name)'} — {ev.date} (cap {ev.capacity})
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }


// // src/pages/SpecialEventsList.jsx
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { listEvents } from '../api';

// export default function SpecialEventsList() {
//   const [events, setEvents] = useState([]);
//   const [loading,setLoading] = useState(true);

//   useEffect(() => {
//     listEvents()
//       .then(setEvents)
//       .catch(e => {
//         console.error(e);
//         alert('Could not load events');
//       })
//       .finally(()=>setLoading(false));
//   }, []);

//   if (loading) return <p>Loading…</p>;
//   if (events.length===0) return <p>No events yet.</p>;

//   return (
//     <div style={{padding:20}}>
//       <h1>Special Events</h1>
//       <ul>
//         {events.map(ev => (
//           <li key={ev.id}>
//             <Link to={`/events/${ev.id}`}>
//               {ev.name} — {ev.date} (cap {ev.capacity})
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//-------------------------------------------------------------------
// // src/pages/SpecialEventsList.jsx
// import React, {useEffect, useState} from 'react';
// import { Link }                   from 'react-router-dom';
// import { listEvents }             from '../api';

// export default function SpecialEventsList() {
//   const [events, setEvents]     = useState([]);
//   const [loading, setLoading]   = useState(true);

//   useEffect(() => {
//     listEvents()
//       .then(setEvents)
//       .catch(()=>alert('Could not load events'))
//       .finally(()=>setLoading(false));
//   }, []);

//   if (loading) return <p>Loading…</p>;
//   if (!events.length) return <p>No special events yet.</p>;

//   return (
//     <div style={{padding:20}}>
//       <h1>Special Events</h1>
//       <ul>
//         {events.map(ev => (
//           <li key={ev.id}>
//             <Link to={`/events/${ev.id}`}>
//               {ev.name || '(no name)'} — {ev.date} (cap {ev.capacity})
//             </Link>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }
//--------------------

//current working code
/* src/pages/SpecialEventsList.jsx */
// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { listEvents } from '../api';
// import './SpecialEventsList.css';

// export default function SpecialEventsList() {
//   const [events, setEvents] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     listEvents()
//       .then(setEvents)
//       .catch(() => alert('Could not load events'))
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) return <p className="loading">Loading…</p>;
//   if (!events.length) return <p className="empty">No special events yet.</p>;

//   return (
//     <div className="events-list-container">
//       <h1 className="page-title">Special Events</h1>
//       <div className="events-grid">
//         {events.map(ev => (
//           <Link to={`/events/${ev.id}`} key={ev.id} className="event-card">
//             <div className="card-header">
//               <h2>{ev.name || '(no name)'}</h2>
//               <span className="event-date">{new Date(ev.date).toLocaleDateString()}</span>
//             </div>
//             <div className="card-body">
//               <p className="event-capacity">Capacity: {ev.capacity}</p>
//             </div>
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

//----------------------------------------
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import pMap from 'p-map';
import { listEvents, listSlots } from '../api';
import './SpecialEventsList.css';

function formatDate(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const [year, month, day] = dateStr.split('-');
  return `${month}/${day}/${year}`;
}

export default function SpecialEventsList() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then(rawEvents =>
        pMap(
          rawEvents,
          async ev => {
            const slots = await listSlots(ev.id);
            const taken = slots.filter(s => s.filled_by).length;
            return {
              ...ev,
              slotsTaken: taken,
              slotsLeft: ev.capacity - taken,
            };
          },
          { concurrency: 5 }
        )
      )
      .then(setEvents)
      .catch(() => alert('Could not load events or slots'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading">Loading…</p>;
  if (!events.length) return <p className="empty">No special events yet.</p>;

  return (
    <div className="events-list-container">
      <h1 className="page-title">Special Events</h1>
      <div className="events-grid">
        {events.map(ev => {
          const isOpen = ev.slotsLeft > 0;
          return (
            <Link
              to={`/events/${ev.id}`}
              key={ev.id}
              className="event-card"
            >
              <div className={`card-header ${isOpen ? 'open' : 'full'}`}>
                <h2>{ev.name || '(no name)'}</h2>
                <span className="event-date">{formatDate(ev.date)}</span>
              </div>
              <div className="card-body">
                <p className="event-capacity">Capacity: {ev.capacity}</p>
                <p className={`event-left ${isOpen ? 'open' : 'full'}`}>
                  Slots left: {isOpen ? ev.slotsLeft : 0}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
