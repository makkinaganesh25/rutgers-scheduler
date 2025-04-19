// File: src/pages/Dashboard.js
import React, { useEffect, useState, useContext, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import './Dashboard.css';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    axios.get('/api/shifts/me')
      .then((resp) => {
        const evs = resp.data.map((s) => {
          const date = s.date.slice(0, 10);
          return {
            id: s.id,
            title: s.shift_name,
            start: `${date}T${s.start_time}`,
            end: `${date}T${s.end_time}`,
            extendedProps: { role: s.role, status: s.status }
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

  const renderEventContent = useCallback((eventInfo) => {
    return (
      <div className="fc-event-custom">
        <strong>{eventInfo.event.title}</strong>
        <span>{eventInfo.timeText}</span>
      </div>
    );
  }, []);

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Weekly Shift Schedule</h1>
      {loading ? (
        <div className="loading-screen">Loading schedule…</div>
      ) : (
        <div className="calendar-wrapper">
          <FullCalendar
            plugins={[timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev today next',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            buttonText={{
              today: 'Today',
              week: 'Week',
              day: 'Day'
            }}
            events={events}
            slotMinTime="06:00:00"
            slotMaxTime="18:00:00"
            slotDuration="01:00:00"
            allDaySlot={false}
            nowIndicator={true}
            height="100%"
            contentHeight="auto"
            eventContent={renderEventContent}
          />
        </div>
      )}
    </div>
  );
}