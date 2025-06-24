// // src/pages/Overview.jsx
// import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import TreeNode from '../components/TreeNode';
// // import api from '../api';
// import api, { getOverviewTree } from '../api';
// import FullCalendar from '@fullcalendar/react';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { SUPERVISOR_ROLES } from '../config/roles';
// import './Overview.css';

// function StatsCards({ events }) {
//   const totalHours = fn =>
//     events.reduce((sum, e) => {
//       let start = new Date(e.start),
//           end   = new Date(e.end);
//       if (end <= start) end = new Date(end.getTime() + 86400000);
//       return fn(start) ? sum + (end - start)/3600000 : sum;
//     }, 0);

//   const now = new Date();
//   const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
//   const isWeek  = d => d >= startOfWeek;
//   const isMonth = d => d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
//   const isYear  = d => d.getFullYear()===now.getFullYear();

//   const weekH  = Math.round(totalHours(isWeek));
//   const monthH = Math.round(totalHours(isMonth));
//   const yearH  = Math.round(totalHours(isYear));

//   const upcoming = events
//     .map(e => ({ ...e, dt:new Date(e.start) }))
//     .filter(e => e.dt > now)
//     .sort((a,b) => a.dt - b.dt)[0] || null;

//   return (
//     <div className="overview-stats">
//       {[
//         {
//           title: 'Next Shift',
//           value: upcoming
//             ? `${upcoming.title} @ ${upcoming.start.slice(11,16)}`
//             : 'None'
//         },
//         { title: 'This Week',  value: `${weekH} hrs`  },
//         { title: 'This Month', value: `${monthH} hrs` },
//         { title: 'This Year',  value: `${yearH} hrs`  }
//       ].map((card,i) => (
//         <div key={i} className="overview-card">
//           <h4>{card.title.toUpperCase()}</h4>
//           <p className="value">{card.value}</p>
//         </div>
//       ))}
//     </div>
//   );
// }

// function CalendarView({ events }) {
//   const now = new Date();
//   const scrollTime = `${String(now.getHours()).padStart(2,'0')}:00:00`;

//   const renderEvent = useCallback(ei => (
//     <div className="fc-event-modern">
//       <strong>{ei.event.title}</strong>
//       <div>{ei.timeText}</div>
//     </div>
//   ), []);

//   return (
//     <FullCalendar
//       plugins={[ timeGridPlugin, interactionPlugin ]}
//       initialView="timeGridWeek"
//       headerToolbar={{
//         left:  'prev,next today',
//         center:'title',
//         right: 'timeGridWeek,timeGridDay'
//       }}
//       buttonText={{ today:'Today', week:'Week', day:'Day' }}
//       events={events}
//       slotMinTime="06:00:00"
//       slotMaxTime="23:00:00"
//       scrollTime={scrollTime}
//       allDaySlot={false}
//       nowIndicator
//       height="60vh"
//       eventContent={renderEvent}
//     />
//   );
// }

// export default function Overview() {
//   const { user } = useAuth();
//   const [tree, setTree]           = useState([]);
//   const [selected, setSelected]   = useState(null);
//   const [allShifts, setAllShifts] = useState([]);
//   const [events, setEvents]       = useState([]);
//   const [search, setSearch]       = useState('');

//   // 1) load the org chart
//   useEffect(() => {
//     getOverviewTree()
//        .then(treeData => setTree(treeData))
//        .catch(err => {
//          console.error('Failed to load org chart', err);
//        });
//   }, []);

//   // 2) load all shifts once
//   useEffect(() => {
//     api.get('/api/shifts')
//        .then(r => setAllShifts(r.data))
//        .catch(console.error);
//   }, []);

//   // 3) whenever `selected` changes, show *only* that person’s shifts
//   useEffect(() => {
//     if (!selected) {
//       setEvents([]);
//       return;
//     }
//     const evs = allShifts
//       .filter(s => s.officer_name === selected.username)
//       .map(s => ({
//         id:    s.id,
//         title: s.shift_type,
//         start: `${s.date.slice(0,10)}T${s.start_time}`,
//         end:   `${s.date.slice(0,10)}T${s.end_time}`
//       }));
//     setEvents(evs);
//   }, [selected, allShifts]);

//   // prune by search
//   const filteredTree = useMemo(() => {
//     function prune(nodes) {
//       return nodes
//         .map(n => ({ ...n, reports: prune(n.reports) }))
//         .filter(n =>
//           n.reports.length > 0 ||
//           n.username.toLowerCase().includes(search.toLowerCase())
//         );
//     }
//     return prune(tree);
//   }, [tree, search]);

//   // guard
//   if (!SUPERVISOR_ROLES.includes(user?.user_rank)) {
//     return (
//       <div className="overview-page">
//         <p className="access-denied">
//           You don’t have permission to view the Overview.<br/>
//           Please contact your supervisor if this is in error.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="overview-page">

//       <aside className="overview-aside">
//         <input
//           type="search"
//           className="overview-search"
//           placeholder="🔍 Search by username…"
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//         />

//         <TreeNode
//           node={{ id:0, username:'All Officers', reports:filteredTree }}
//           onSelect={setSelected}
//           root={true}
//         />
//       </aside>

//       <main className="overview-main">
//         {!selected && (
//           <p className="overview-placeholder">
//             Select someone on the left to view their schedule.
//           </p>
//         )}

//         {selected && (
//           <>
//             <h2 className="overview-title">
//               {selected.username}
//               {selected.reports.length > 0
//                 ? `’s Team (${selected.user_rank})`
//                 : ` (${selected.user_rank})`
//               }
//             </h2>

//             <StatsCards events={events} />

//             {selected.reports.length > 0 && (
//               <div className="team-dashboard">
//                 <table className="team-table">
//                   <thead>
//                     <tr>
//                       <th>Username</th>
//                       <th>Rank</th>
//                       <th>Next Shift</th>
//                       <th>Week Hrs</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {selected.reports.map(o => {
//                       // compute each report’s stats from `allShifts`
//                       const theirShifts = allShifts.filter(s => s.officer_name === o.username);
//                       const theirEvents = theirShifts.map(s => ({
//                         start: `${s.date.slice(0,10)}T${s.start_time}`,
//                         end:   `${s.date.slice(0,10)}T${s.end_time}`,
//                         title: s.shift_type
//                       }));
//                       const now = new Date();
//                       const next = theirEvents
//                         .map(e => ({ ...e, dt:new Date(e.start) }))
//                         .filter(e => e.dt > now)
//                         .sort((a,b)=>a.dt-b.dt)[0];
//                       const weekHrs = Math.round(theirEvents.reduce((sum,e) => {
//                         const s = new Date(e.start), 
//                               en = new Date(e.end);
//                         return s >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
//                           ? sum + (en - s)/3600000
//                           : sum;
//                       }, 0));

//                       return (
//                         <tr key={o.id}>
//                           <td>{o.username}</td>
//                           <td>{o.user_rank}</td>
//                           <td>{next ? `${next.title}` : '—'}</td>
//                           <td>{weekHrs} hrs</td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             <CalendarView key={selected.username} events={events}/>
//           </>
//         )}
//       </main>
//     </div>
//   );
// }

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TreeNode from '../components/TreeNode';
import api, { getOverviewTree } from '../api';
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

  const weekH  = Math.round(totalHours(isWeek));
  const monthH = Math.round(totalHours(isMonth));

  const upcoming = events
    .map(e => ({ ...e, dt:new Date(e.start) }))
    .filter(e => e.dt > now)
    .sort((a,b) => a.dt - b.dt)[0] || null;

  return (
    <div className="overview-stats">
      <div className="overview-card">
        <h4>Next Shift</h4>
        <p className="value">{upcoming ? `${upcoming.title} @ ${upcoming.start.slice(11,16)}` : 'None'}</p>
      </div>
      <div className="overview-card">
        <h4>This Week</h4>
        <p className="value">{`${weekH} hrs`}</p>
      </div>
       <div className="overview-card">
        <h4>This Month</h4>
        <p className="value">{`${monthH} hrs`}</p>
      </div>
    </div>
  );
}

function CalendarView({ events, windowWidth }) {
  const now = new Date();
  const scrollTime = `${String(now.getHours()).padStart(2,'0')}:00:00`;
  const isMobile = windowWidth < 768;

  const renderEvent = useCallback(ei => (
    <div className="fc-event-modern">
      <strong>{ei.event.title}</strong>
      <div>{ei.timeText}</div>
    </div>
  ), []);

  return (
    <div className="overview-calendar">
        <FullCalendar
            plugins={[ timeGridPlugin, interactionPlugin ]}
            initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
            headerToolbar={{
                left:  isMobile ? 'prev,next' : 'prev,next today',
                center:'title',
                right: 'timeGridDay,timeGridWeek'
            }}
            buttonText={{ today:'Today', week:'Week', day:'Day' }}
            events={events}
            slotMinTime="00:00:00"  /* <<< CORRECTED */
            slotMaxTime="24:00:00"  /* <<< CORRECTED */
            scrollTime={scrollTime}
            allDaySlot={false}
            nowIndicator
            height="auto"
            eventContent={renderEvent}
        />
    </div>
  );
}

export default function Overview() {
  const { user } = useAuth();
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [allShifts, setAllShifts] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    getOverviewTree().then(setTree).catch(err => console.error('Failed to load org chart', err));
    api.get('/api/shifts').then(r => setAllShifts(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (!selected) return setEvents([]);
    const evs = allShifts
      .filter(s => s.officer_name === selected.username)
      .map(s => ({
        id: s.id, title: s.shift_type,
        start: `${s.date.slice(0,10)}T${s.start_time}`,
        end:   `${s.date.slice(0,10)}T${s.end_time}`
      }));
    setEvents(evs);
  }, [selected, allShifts]);

  const filteredTree = useMemo(() => {
    const lowerCaseSearch = search.toLowerCase();
    function prune(nodes) {
      return nodes
        .map(n => ({ ...n, reports: prune(n.reports) }))
        .filter(n => n.reports.length > 0 || n.username.toLowerCase().includes(lowerCaseSearch));
    }
    return search ? prune(tree) : tree;
  }, [tree, search]);

  if (!SUPERVISOR_ROLES.includes(user?.user_rank)) {
    return (
      <div className="overview-page">
        <p className="access-denied">You don’t have permission to view the Overview.</p>
      </div>
    );
  }

  return (
    <div className={`overview-page ${selected ? 'show-main' : 'show-aside'}`}>
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
          selectedId={selected?.id}
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
            <button className="back-to-list-btn" onClick={() => setSelected(null)}>
              &larr; Back to Officer List
            </button>
            <h2 className="overview-title">
              {selected.username}’s Dashboard
            </h2>
            <StatsCards events={events} />
            {selected.reports.length > 0 && (
              <div className="team-dashboard">
                <h3>{selected.username}'s Team</h3>
                <div className="table-wrapper">
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
                        const theirShifts = allShifts.filter(s => s.officer_name === o.username);
                        const theirEvents = theirShifts.map(s => ({
                          start: `${s.date.slice(0,10)}T${s.start_time}`,
                          end:   `${s.date.slice(0,10)}T${s.end_time}`,
                          title: s.shift_type
                        }));
                        const now = new Date();
                        const next = theirEvents.map(e => ({ ...e, dt:new Date(e.start) })).filter(e => e.dt > now).sort((a,b)=>a.dt-b.dt)[0];
                        const weekHrs = Math.round(theirEvents.reduce((sum,e) => {
                          const s = new Date(e.start);
                          const en = new Date(e.end);
                          return s >= new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()) ? sum + (en - s)/3600000 : sum;
                        }, 0));
                        return (
                          <tr key={o.id} onClick={() => setSelected(o)}>
                            <td data-label="Username">{o.username}</td>
                            <td data-label="Rank">{o.user_rank}</td>
                            <td data-label="Next Shift">{next ? `${next.title}` : '—'}</td>
                            <td data-label="Week Hrs">{weekHrs} hrs</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <CalendarView key={selected.username} events={events} windowWidth={windowWidth} />
          </>
        )}
      </main>
    </div>
  );
}
