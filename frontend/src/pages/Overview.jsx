//   // src/pages/Overview.jsx
// import React, {
//     useEffect,
//     useState,
//     useMemo,
//     useCallback
//   } from 'react';
//   import { useAuth } from '../contexts/AuthContext';
//   import TreeNode from '../components/TreeNode';
//   import api from '../api';
//   import FullCalendar from '@fullcalendar/react';
//   import timeGridPlugin from '@fullcalendar/timegrid';
//   import interactionPlugin from '@fullcalendar/interaction';
//   import { SUPERVISOR_ROLES } from '../config/roles';
//   import './Overview.css';
  
//   function StatsCards({ events }) {
//     const totalHours = fn =>
//       events.reduce((sum, ev) => {
//         let start = new Date(ev.start),
//             end   = new Date(ev.end);
//         if (end <= start) end = new Date(end.getTime() + 86400000);
//         return fn(start) ? sum + (end - start) / 3600000 : sum;
//       }, 0);
  
//     const now = new Date();
//     const startOfWeek = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate() - now.getDay()
//     );
//     const isWeek  = d => d >= startOfWeek;
//     const isMonth = d =>
//       d.getMonth() === now.getMonth() &&
//       d.getFullYear() === now.getFullYear();
//     const isYear  = d => d.getFullYear() === now.getFullYear();
  
//     const weekH  = Math.round(totalHours(isWeek));
//     const monthH = Math.round(totalHours(isMonth));
//     const yearH  = Math.round(totalHours(isYear));
  
//     const upcoming = events
//       .map(e => ({ ...e, dt: new Date(e.start) }))
//       .filter(e => e.dt > now)
//       .sort((a, b) => a.dt - b.dt)[0] || null;
  
//     return (
//       <div className="overview-stats">
//         {[
//           {
//             title: 'Next Shift',
//             value: upcoming
//               ? `${upcoming.title} @ ${upcoming.start.slice(11,16)}`
//               : 'None'
//           },
//           { title: 'This Week',  value: `${weekH} hrs` },
//           { title: 'This Month', value: `${monthH} hrs` },
//           { title: 'This Year',  value: `${yearH} hrs` }
//         ].map((c,i) => (
//           <div key={i} className="overview-card">
//             <h4>{c.title.toUpperCase()}</h4>
//             <p className="value">{c.value}</p>
//           </div>
//         ))}
//       </div>
//     );
//   }
  
//   function CalendarView({ events }) {
//     const now = new Date();
//     const scrollTime = `${String(now.getHours()).padStart(2,'0')}:00:00`;
//     const renderEvent = useCallback(ev => (
//       <div className="fc-event-modern">
//         <strong>{ev.event.title}</strong>
//         <div>{ev.timeText}</div>
//       </div>
//     ), []);
  
//     return (
//       <FullCalendar
//         plugins={[ timeGridPlugin, interactionPlugin ]}
//         initialView="timeGridWeek"
//         headerToolbar={{
//           left:  'prev,next today',
//           center:'title',
//           right: 'timeGridWeek,timeGridDay'
//         }}
//         buttonText={{ today:'Today', week:'Week', day:'Day' }}
//         events={events}
//         slotMinTime="06:00:00"
//         slotMaxTime="23:00:00"
//         scrollTime={scrollTime}
//         allDaySlot={false}
//         nowIndicator
//         height="60vh"
//         eventContent={renderEvent}
//       />
//     );
//   }
  
//   export default function Overview() {
//     const { user } = useAuth();
//     const [tree, setTree]         = useState([]);
//     const [selected, setSelected] = useState(null);
//     const [allShifts, setAllShifts] = useState([]);
//     const [events, setEvents]     = useState([]);
//     const [search, setSearch]     = useState('');
  
//     // 1) load the org chart
//     useEffect(() => {
//       api.get('/api/overview/tree').then(r => setTree(r.data)).catch(console.error);
//     }, []);
  
//     // 2) load *all* shifts once
//     useEffect(() => {
//       api.get('/api/shifts').then(r => setAllShifts(r.data)).catch(console.error);
//     }, []);
  
//     // 3) whenever `selected` changes, filter shifts
//     useEffect(() => {
//       if (!selected) {
//         setEvents([]);
//         return;
//       }
//       const matches = allShifts.filter(s => s.officer_name === selected.username);
//       const evs = matches.map(s => ({
//         id:    s.id,
//         title: s.shift_type,
//         start: `${s.date.slice(0,10)}T${s.start_time}`,
//         end:   `${s.date.slice(0,10)}T${s.end_time}`
//       }));
//       setEvents(evs);
//     }, [selected, allShifts]);
  
//     // flatten tree for search
//     const allOfficers = useMemo(() => {
//       const list = [];
//       (function walk(ns) {
//         for (let n of ns) {
//           list.push(n);
//           if (n.reports.length) walk(n.reports);
//         }
//       })(tree);
//       return list;
//     }, [tree]);
  
//     // prune by search
//     const filteredTree = useMemo(() => {
//       function prune(nodes) {
//         return nodes
//           .map(n => ({ ...n, reports: prune(n.reports) }))
//           .filter(n =>
//             n.reports.length > 0 ||
//             n.username.toLowerCase().includes(search.toLowerCase())
//           );
//       }
//       return prune(tree);
//     }, [tree, search]);
  
//     // 4) permission guard
//     if (!SUPERVISOR_ROLES.includes(user?.user_rank)) {
//       return (
//         <div className="overview-page">
//           <p className="access-denied">
//             You don’t have permission to view the Overview.<br/>
//             Please contact your supervisor if this is in error.
//           </p>
//         </div>
//       );
//     }
  
//     return (
//       <div className="overview-page">
  
//         <aside className="overview-aside">
//           <input
//             type="search"
//             className="overview-search"
//             placeholder="🔍 Search by username…"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
  
//           <TreeNode
//             node={{ id:0, username:'All Officers', reports:filteredTree }}
//             onSelect={setSelected}
//             root={true}
//           />
//         </aside>
  
//         <main className="overview-main">
//           {!selected && (
//             <p className="overview-placeholder">
//               Select someone on the left to view their schedule.
//             </p>
//           )}
  
//           {selected && (
//             <>
//               <h2 className="overview-title">
//                 {selected.username}
//                 {selected.reports.length > 0
//                   ? `’s Team (${selected.user_rank})`
//                   : ` (${selected.user_rank})`
//                 }
//               </h2>
  
//               <StatsCards events={events} />
  
//               {selected.reports.length > 0 && (
//                 <div className="team-dashboard">
//                   <table className="team-table">
//                     <thead>
//                       <tr>
//                         <th>Username</th>
//                         <th>Rank</th>
//                         <th>Next Shift</th>
//                         <th>Week Hrs</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selected.reports.map(o => (
//                         <tr key={o.id}>
//                           <td>{o.username}</td>
//                           <td>{o.user_rank}</td>
//                           <td>{o.nextShift||'—'}</td>
//                           <td>{o.weekHours||0}</td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
  
//               {/* remount on every new `selected.username` */}
//               <CalendarView key={selected.username} events={events}/>
//             </>
//           )}
//         </main>
//       </div>
//     );
//   }
  

// src/pages/Overview.jsx
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TreeNode from '../components/TreeNode';
import api from '../api';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { SUPERVISOR_ROLES } from '../config/roles';
import './Overview.css';

function StatsCards({ events }) {
  const totalHours = fn =>
    events.reduce((sum, e) => {
      let start = new Date(e.start),
          end   = new Date(e.end);
      if (end <= start) end = new Date(end.getTime() + 86400000);
      return fn(start) ? sum + (end - start)/3600000 : sum;
    }, 0);

  const now = new Date();
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const isWeek  = d => d >= startOfWeek;
  const isMonth = d => d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
  const isYear  = d => d.getFullYear()===now.getFullYear();

  const weekH  = Math.round(totalHours(isWeek));
  const monthH = Math.round(totalHours(isMonth));
  const yearH  = Math.round(totalHours(isYear));

  const upcoming = events
    .map(e => ({ ...e, dt:new Date(e.start) }))
    .filter(e => e.dt > now)
    .sort((a,b) => a.dt - b.dt)[0] || null;

  return (
    <div className="overview-stats">
      {[
        {
          title: 'Next Shift',
          value: upcoming
            ? `${upcoming.title} @ ${upcoming.start.slice(11,16)}`
            : 'None'
        },
        { title: 'This Week',  value: `${weekH} hrs`  },
        { title: 'This Month', value: `${monthH} hrs` },
        { title: 'This Year',  value: `${yearH} hrs`  }
      ].map((card,i) => (
        <div key={i} className="overview-card">
          <h4>{card.title.toUpperCase()}</h4>
          <p className="value">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function CalendarView({ events }) {
  const now = new Date();
  const scrollTime = `${String(now.getHours()).padStart(2,'0')}:00:00`;

  const renderEvent = useCallback(ei => (
    <div className="fc-event-modern">
      <strong>{ei.event.title}</strong>
      <div>{ei.timeText}</div>
    </div>
  ), []);

  return (
    <FullCalendar
      plugins={[ timeGridPlugin, interactionPlugin ]}
      initialView="timeGridWeek"
      headerToolbar={{
        left:  'prev,next today',
        center:'title',
        right: 'timeGridWeek,timeGridDay'
      }}
      buttonText={{ today:'Today', week:'Week', day:'Day' }}
      events={events}
      slotMinTime="06:00:00"
      slotMaxTime="23:00:00"
      scrollTime={scrollTime}
      allDaySlot={false}
      nowIndicator
      height="60vh"
      eventContent={renderEvent}
    />
  );
}

export default function Overview() {
  const { user } = useAuth();
  const [tree, setTree]           = useState([]);
  const [selected, setSelected]   = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [events, setEvents]       = useState([]);
  const [search, setSearch]       = useState('');

  // 1) load the org chart
  useEffect(() => {
    api.get('/api/overview/tree')
       .then(r => setTree(r.data))
       .catch(console.error);
  }, []);

  // 2) load all shifts once
  useEffect(() => {
    api.get('/api/shifts')
       .then(r => setAllShifts(r.data))
       .catch(console.error);
  }, []);

  // 3) whenever `selected` changes, show *only* that person’s shifts
  useEffect(() => {
    if (!selected) {
      setEvents([]);
      return;
    }
    const evs = allShifts
      .filter(s => s.officer_name === selected.username)
      .map(s => ({
        id:    s.id,
        title: s.shift_type,
        start: `${s.date.slice(0,10)}T${s.start_time}`,
        end:   `${s.date.slice(0,10)}T${s.end_time}`
      }));
    setEvents(evs);
  }, [selected, allShifts]);

  // prune by search
  const filteredTree = useMemo(() => {
    function prune(nodes) {
      return nodes
        .map(n => ({ ...n, reports: prune(n.reports) }))
        .filter(n =>
          n.reports.length > 0 ||
          n.username.toLowerCase().includes(search.toLowerCase())
        );
    }
    return prune(tree);
  }, [tree, search]);

  // guard
  if (!SUPERVISOR_ROLES.includes(user?.user_rank)) {
    return (
      <div className="overview-page">
        <p className="access-denied">
          You don’t have permission to view the Overview.<br/>
          Please contact your supervisor if this is in error.
        </p>
      </div>
    );
  }

  return (
    <div className="overview-page">

      <aside className="overview-aside">
        <input
          type="search"
          className="overview-search"
          placeholder="🔍 Search by username…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <TreeNode
          node={{ id:0, username:'All Officers', reports:filteredTree }}
          onSelect={setSelected}
          root={true}
        />
      </aside>

      <main className="overview-main">
        {!selected && (
          <p className="overview-placeholder">
            Select someone on the left to view their schedule.
          </p>
        )}

        {selected && (
          <>
            <h2 className="overview-title">
              {selected.username}
              {selected.reports.length > 0
                ? `’s Team (${selected.user_rank})`
                : ` (${selected.user_rank})`
              }
            </h2>

            <StatsCards events={events} />

            {selected.reports.length > 0 && (
              <div className="team-dashboard">
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Rank</th>
                      <th>Next Shift</th>
                      <th>Week Hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.reports.map(o => {
                      // compute each report’s stats from `allShifts`
                      const theirShifts = allShifts.filter(s => s.officer_name === o.username);
                      const theirEvents = theirShifts.map(s => ({
                        start: `${s.date.slice(0,10)}T${s.start_time}`,
                        end:   `${s.date.slice(0,10)}T${s.end_time}`,
                        title: s.shift_type
                      }));
                      const now = new Date();
                      const next = theirEvents
                        .map(e => ({ ...e, dt:new Date(e.start) }))
                        .filter(e => e.dt > now)
                        .sort((a,b)=>a.dt-b.dt)[0];
                      const weekHrs = Math.round(theirEvents.reduce((sum,e) => {
                        const s = new Date(e.start), 
                              en = new Date(e.end);
                        return s >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
                          ? sum + (en - s)/3600000
                          : sum;
                      }, 0));

                      return (
                        <tr key={o.id}>
                          <td>{o.username}</td>
                          <td>{o.user_rank}</td>
                          <td>{next ? `${next.title}` : '—'}</td>
                          <td>{weekHrs} hrs</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <CalendarView key={selected.username} events={events}/>
          </>
        )}
      </main>
    </div>
  );
}
