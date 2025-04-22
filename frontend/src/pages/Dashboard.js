// File: src/pages/Dashboard.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

function StatsCards({ events }) {
  // Sum up the total hours for events passing filterFn.
  const totalHours = (filterFn) =>
    events.reduce((sum, ev) => {
      const start = new Date(ev.start);
      let end   = new Date(ev.end);

      // If end <= start, assume it rolled past midnight → add 24h
      if (end <= start) {
        end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      }

      const hours = (end - start) / (1000 * 60 * 60);
      return filterFn(start) ? sum + hours : sum;
    }, 0);

  const now = new Date();

  // Helpers for filtering by week / month / year:
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const isWeek  = (d) => d >= startOfWeek && d < startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000;
  const isMonth = (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  const isYear  = (d) => d.getFullYear() === now.getFullYear();

  const weekH  = Math.round(totalHours(isWeek));
  const monthH = Math.round(totalHours(isMonth));
  const yearH  = Math.round(totalHours(isYear));

  // Next upcoming shift card
  const upcoming = events
    .map(ev => ({ ...ev, dateObj: new Date(ev.start) }))
    .filter(ev => ev.dateObj > now)
    .sort((a, b) => a.dateObj - b.dateObj)[0];

  return (
    <div className="stats-cards">
      <div className="card">
        <h4>Next Shift</h4>
        {upcoming
          ? <p>
              {upcoming.title}<br/>
              {upcoming.start.slice(11,16)}–{upcoming.end.slice(11,16)}
            </p>
          : <p>None</p>
        }
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
        // Build ISO datetimes for FullCalendar
        const date = s.date.slice(0,10);
        return {
          id:    s.id,
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
                nowIndicator
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
