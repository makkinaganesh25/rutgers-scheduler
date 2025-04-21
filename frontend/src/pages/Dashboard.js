// File: src/pages/Dashboard.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

// Inline StatsCards component
function StatsCards({ events }) {
  // helper to sum hours in a period
  const totalHours = (filterFn) =>
    events.reduce((sum, ev) => {
      // const [date, time] = ev.start.split('T');
      const start = new Date(ev.start);
      const end   = new Date(ev.end);
      return filterFn(start) ? sum + (end - start) / (1000 * 60 * 60) : sum;
    }, 0);

  const now = new Date();
  const isWeek = d => {
    const diff = (d - new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()));
    return diff >= 0 && diff < 7 * 24*60*60*1000;
  };
  const isMonth = d => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear = d => d.getFullYear() === now.getFullYear();

  const weekH = Math.round(totalHours(isWeek));
  const monthH = Math.round(totalHours(isMonth));
  const yearH = Math.round(totalHours(isYear));

  // next shift
  const upcoming = events
    .map(ev => ({ ...ev, date: new Date(ev.start) }))
    .filter(ev => ev.date > now)
    .sort((a, b) => a.date - b.date)[0];

  return (
    <div className="stats-cards">
      <div className="card">
        <h4>Next Shift</h4>
        {upcoming
          ? <p>{upcoming.title}<br/>{upcoming.start.slice(11,16)}–{upcoming.end.slice(11,16)}</p>
          : <p>None</p>}
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
  const { logout } = useContext(AuthContext);

  const now = new Date();
  const scrollTime = `${String(now.getHours()).padStart(2,'0')}:00:00`;

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:50001/api/shifts/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(resp => {
      const evs = resp.data.map(s => {
        const date = s.date.slice(0,10);
        return {
          id: s.id,
          title: s.shift_type,
          start: `${date}T${s.start_time}`,
          end:   `${date}T${s.end_time}`,
        };
      });
      setEvents(evs);
    })
    .catch(err => {
      console.error(err);
      if (err.response?.status === 401) logout();
    })
    .finally(() => setLoading(false));
  }, [logout]);

  const renderEventContent = useCallback(eventInfo => (
    <div className="fc-event-modern">
      <strong>{eventInfo.event.title}</strong>
      <div>{eventInfo.timeText}</div>
    </div>
  ), []);

  return (
    <div className="dashboard-modern">
      <header className="header-modern">
        <h1>Weekly Shift Schedule</h1>
      </header>

      {loading
        ? <div className="loading-modern">Loading...</div>
        : (
          <>
            {/* Stats widget below title */}
            <StatsCards events={events} />

            <div className="calendar-wrap-modern">
              <FullCalendar
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'timeGridWeek,timeGridDay'
                }}
                buttonText={{ today: 'Today', week: 'Week', day: 'Day' }}
                events={events}
                slotMinTime="00:00:00"
                slotMaxTime="24:00:00"
                scrollTime={scrollTime}
                slotDuration="01:00:00"
                allDaySlot={false}
                nowIndicator={true}
                height="80vh"
                eventContent={renderEventContent}
                className="fc-modern"
              />
            </div>
          </>
        )
      }
    </div>
  );
}