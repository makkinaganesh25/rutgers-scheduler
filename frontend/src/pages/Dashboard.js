// // File: src/pages/Dashboard.js
// import React, { useEffect, useState, useCallback } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import api from '../api';
// import { useAuth } from '../contexts/AuthContext';
// import './Dashboard.css';

// function StatsCards({ events }) {
//   const totalHours = (filterFn) =>
//     events.reduce((sum, ev) => {
//       const start = new Date(ev.start);
//       let end = new Date(ev.end);
//       if (end <= start) {
//         end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
//       }
//       const hours = (end - start) / (1000 * 60 * 60);
//       return filterFn(start) ? sum + hours : sum;
//     }, 0);

//   const now = new Date();
//   const startOfWeek = new Date(
//     now.getFullYear(),
//     now.getMonth(),
//     now.getDate() - now.getDay()
//   );
//   const isWeek  = (d) => d >= startOfWeek;
//   const isMonth = (d) =>
//     d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
//   const isYear  = (d) => d.getFullYear() === now.getFullYear();

//   const weekH  = Math.round(totalHours(isWeek));
//   const monthH = Math.round(totalHours(isMonth));
//   const yearH  = Math.round(totalHours(isYear));

//   const upcoming = events
//     .map((ev) => ({ ...ev, dateObj: new Date(ev.start) }))
//     .filter((ev) => ev.dateObj > now)
//     .sort((a, b) => a.dateObj - b.dateObj)[0];

//   return (
//     <div className="stats-cards">
//       <div className="card">
//         <h4>Next Shift</h4>
//         {upcoming ? (
//           <p>
//             {upcoming.title}
//             <br />
//             {upcoming.start.slice(11, 16)}–{upcoming.end.slice(11, 16)}
//           </p>
//         ) : (
//           <p>None</p>
//         )}
//       </div>
//       <div className="card">
//         <h4>This Week</h4>
//         <p>{weekH} hrs</p>
//       </div>
//       <div className="card">
//         <h4>This Month</h4>
//         <p>{monthH} hrs</p>
//       </div>
//       <div className="card">
//         <h4>This Year</h4>
//         <p>{yearH} hrs</p>
//       </div>
//     </div>
//   );
// }

// export default function Dashboard() {
//   const [events, setEvents]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { logout } = useAuth();

//   const now = new Date();
//   const scrollTime = `${String(now.getHours()).padStart(2, '0')}:00:00`;

//   useEffect(() => {
//     api.get('/api/shifts/me')
//       .then((resp) => {
//         const evs = resp.data.map((s) => {
//           const date = s.date.slice(0, 10);
//           return {
//             id:    s.id,
//             title: s.shift_type,
//             start: `${date}T${s.start_time}`,
//             end:   `${date}T${s.end_time}`,
//           };
//         });
//         setEvents(evs);
//       })
//       .catch((err) => {
//         console.error(err);
//         if (err.response?.status === 401) logout();
//       })
//       .finally(() => setLoading(false));
//   }, [logout]);

//   const renderEventContent = useCallback((eventInfo) => (
//     <div>
//       <strong>{eventInfo.event.title}</strong>
//       <div>{eventInfo.timeText}</div>
//     </div>
//   ), []);

//   if (loading) {
//     return <div className="loading-modern">Loading...</div>;
//   }

//   return (
//     <div className="dashboard-modern">
//       <header className="header-modern">
//         <h1>Weekly Shift Schedule</h1>
//       </header>

//       <StatsCards events={events} />

//       <div className="calendar-wrap-modern">
//         <FullCalendar
//           plugins={[timeGridPlugin, interactionPlugin]}
//           initialView="timeGridWeek"
//           headerToolbar={{
//             left:  'prev,next today',
//             center:'title',
//             right: 'timeGridWeek,timeGridDay'
//           }}
//           buttonText={{ today: 'Today', week: 'Week', day: 'Day' }}
//           events={events}
//           slotMinTime="00:00:00"
//           slotMaxTime="24:00:00"
//           scrollTime={scrollTime}
//           slotDuration="01:00:00"
//           allDaySlot={false}
//           nowIndicator
//           height="80vh"
//           eventContent={renderEventContent}
//         />
//       </div>
//     </div>
//   );
// }


// File: src/pages/Dashboard.js
import React, { useEffect, useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

function StatsCards({ events }) {
  const totalHours = (filterFn) =>
    events.reduce((sum, ev) => {
      const start = new Date(ev.start);
      let end = new Date(ev.end);
      if (end <= start) {
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }
      const hours = (end - start) / (1000 * 60 * 60);
      return filterFn(start) ? sum + hours : sum;
    }, 0);

  const now = new Date();
  const startOfWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  );
  const isWeek  = (d) => d >= startOfWeek;
  const isMonth = (d) =>
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear  = (d) => d.getFullYear() === now.getFullYear();

  const weekH  = Math.round(totalHours(isWeek));
  const monthH = Math.round(totalHours(isMonth));
  const yearH  = Math.round(totalHours(isYear));

  const upcoming = events
    .map((ev) => ({ ...ev, dateObj: new Date(ev.start) }))
    .filter((ev) => ev.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  return (
    <div className="stats-cards">
      <div className="card">
        <h4>Next Shift</h4>
        {upcoming ? (
          <p>
            {upcoming.title}
            <br />
            {upcoming.start.slice(11, 16)}–{upcoming.end.slice(11, 16)}
          </p>
        ) : (
          <p>None</p>
        )}
      </div>
      <div className="card">
        <h4>This Week</h4>
        <p>{weekH} hrs</p>
      </div>
      <div className="card">
        <h4>This Month</h4>
        <p>{monthH} hrs</p>
      </div>
      <div className="card">
        <h4>This Year</h4>
        <p>{yearH} hrs</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { logout } = useAuth();

  const now = new Date();
  const scrollTime = `${String(now.getHours()).padStart(2, '0')}:00:00`;
  
  // --- START: New logic to detect screen size ---
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // --- END: New logic to detect screen size ---

  useEffect(() => {
    api.get('/api/shifts/me')
      .then((resp) => {
        const evs = resp.data.map((s) => {
          const date = s.date.slice(0, 10);
          return {
            id:    s.id,
            title: s.shift_type,
            start: `${date}T${s.start_time}`,
            end:   `${date}T${s.end_time}`,
          };
        });
        setEvents(evs);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) logout();
      })
      .finally(() => setLoading(false));
  }, [logout]);

  const renderEventContent = useCallback((eventInfo) => (
    <div className="event-content">
      <strong>{eventInfo.event.title}</strong>
      <div>{eventInfo.timeText}</div>
    </div>
  ), []);
  
  // --- Conditionally set calendar options based on screen size ---
  const isMobile = windowWidth < 768;

  const calendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: isMobile ? 'timeGridDay' : 'timeGridWeek', // Default to Day view on mobile
    headerToolbar: {
      left: isMobile ? 'prev,next' : 'prev,next today', // Hide 'today' on mobile to save space
      center: 'title',
      right: 'timeGridDay,timeGridWeek' // Keep view switchers, but 'day' is now default on mobile
    },
    buttonText: { today: 'Today', week: 'Week', day: 'Day' },
    events: events,
    slotMinTime: "00:00:00",
    slotMaxTime: "24:00:00",
    scrollTime: scrollTime,
    slotDuration: "01:00:00",
    allDaySlot: false,
    nowIndicator: true,
    height: "auto", // Changed for better responsive behavior
    eventContent: renderEventContent,
  };

  if (loading) {
    return <div className="loading-modern">Loading...</div>;
  }

  return (
    <div className="dashboard-modern">
      <header className="header-modern">
        <h1>Weekly Shift Schedule</h1>
      </header>

      <StatsCards events={events} />

      <div className="calendar-wrap-modern">
        <FullCalendar {...calendarOptions} />
      </div>
    </div>
  );
}
