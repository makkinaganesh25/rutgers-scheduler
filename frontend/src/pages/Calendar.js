// calendar.js
import React, { useEffect, useState } from 'react';
import './Calendar.css';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [showWorkHours, setShowWorkHours] = useState(false);
  const [workHours, setWorkHours] = useState(0);

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/calendar');
        if (!response.ok) {
          throw new Error('Failed to fetch calendar events');
        }
        const calendarEvents = await response.json();
        setEvents(calendarEvents);
        calculateWorkHours(calendarEvents);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      }
    };

    fetchCalendarEvents();
  }, []);

  const calculateWorkHours = (events) => {
    let hours = 0;
    events.forEach((event) => {
      if (event.summary.includes('Shift')) {
        const start = new Date(event.start.dateTime);
        const end = new Date(event.end.dateTime);
        const duration = (end - start) / (1000 * 60 * 60); // Convert milliseconds to hours
        hours += duration;
      }
    });
    setWorkHours(hours);
  };

  const toggleWorkHours = () => {
    setShowWorkHours(!showWorkHours);
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>My Calendar</h2>
        <label className="toggle-label">
          <input type="checkbox" onChange={toggleWorkHours} />
          Show Work Hours
        </label>
        {showWorkHours && <p>Total Work Hours Today: {workHours} hours</p>}
      </div>
      <div className="calendar-events">
        {events.length ? (
          events.map((event) => (
            <div key={event.id} className={`calendar-event ${event.summary.includes('Shift') ? 'shift' : ''}`}>
              <h4>{event.summary}</h4>
              <p>
                {new Date(event.start.dateTime).toLocaleString()} - {new Date(event.end.dateTime).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No events scheduled.</p>
        )}
      </div>
    </div>
  );
};

export default Calendar;
