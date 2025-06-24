// // src/pages/AdminEvents.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   listEvents,
//   createEvent,
//   addSlots,
//   updateEvent,
//   updateEventSlot,
//   deleteEvent
// } from '../api';
// import SyncSheetsButton from '../components/SyncSheetsButton';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './AdminEvents.css';

// function formatDate(dateStr) {
//   // dateStr is "YYYY-MM-DD"
//   const [y, m, d] = dateStr.split('-');
//   return `${m}/${d}/${y}`;
// }

// export default function AdminEvents() {
//   const { addNotification } = useNotifications();

//   // All events from the server
//   const [events, setEvents] = useState([]);
//   // 'ongoing' or 'archived'
//   const [view, setView] = useState('ongoing');
//   // currently editing event ID
//   const [editingId, setEditingId] = useState(null);
//   // form fields for event
//   const [form, setForm] = useState({
//     name: '',
//     date: '',
//     description: '',
//     capacity: 0
//   });
//   // slots for the event being edited
//   const [slots, setSlots] = useState([
//     { id: null, filled_by: null, filled_name: '', filled_rank: '', assignment: '', time_in: '', time_out: '' }
//   ]);

//   // load all events once
//   useEffect(() => {
//     reload();
//   }, []);

//   function reload() {
//     listEvents()
//       .then(data => {
//         // sort ascending by date
//         const sorted = data.sort((a,b)=> a.date.localeCompare(b.date));
//         setEvents(sorted);
//       })
//       .catch(() => alert('Could not load events'));
//   }

//   // helper: today in YYYY-MM-DD
//   const today = new Date().toISOString().slice(0,10);

//   // filter events based on view
//   const filtered = events.filter(ev =>
//     view === 'ongoing'
//       ? ev.date >= today
//       : ev.date < today
//   );

//   // start editing an event
//   async function startEdit(ev) {
//     setEditingId(ev.id);
//     setForm({
//       name: ev.name,
//       date: ev.date,
//       description: ev.description,
//       capacity: ev.capacity
//     });
//     // fetch its slots (with filled_name & filled_rank via updated backend)
//     const res = await fetch(
//       `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/events/${ev.id}`,
//       { headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` } }
//     );
//     const data = await res.json();
//     setSlots(
//       data.slots.map(s => ({
//         ...s,
//         // ensure all keys exist
//         filled_name: s.filled_name||'',
//         filled_rank: s.filled_rank||'',
//       }))
//     );
//   }

//   // create or update
//   async function onSubmit(e) {
//     e.preventDefault();
//     if (!form.name || !form.date) {
//       return alert('Name & date required');
//     }

//     try {
//       if (editingId) {
//         await updateEvent(editingId, {
//           name: form.name,
//           date: form.date,
//           description: form.description,
//           capacity: form.capacity
//         });
//         // update each existing slot
//         await Promise.all(
//           slots.map(s =>
//             updateEventSlot(editingId, s.id, {
//               assignment: s.assignment,
//               time_in:    s.time_in,
//               time_out:   s.time_out
//             })
//           )
//         );
//         alert('✅ Event updated');
//       } else {
//         const { id } = await createEvent({
//           name: form.name,
//           date: form.date,
//           description: form.description,
//           capacity: form.capacity
//         });
//         await addSlots(
//           id,
//           slots.map(s => ({
//             assignment: s.assignment,
//             time_in:    s.time_in,
//             time_out:   s.time_out
//           }))
//         );
//         alert('✅ Event published');
//         addNotification({
//           title: 'New Special Event Published',
//           body: `${form.name} on ${formatDate(form.date)} has been created.`
//         });
//       }
//       // reset & reload
//       setEditingId(null);
//       setForm({ name:'', date:'', description:'', capacity:0 });
//       setSlots([{ id: null, filled_by: null, filled_name:'', filled_rank:'', assignment:'', time_in:'', time_out:'' }]);
//       reload();
//     } catch (err) {
//       alert('Save failed: ' + (err.response?.data?.error || err.message));
//     }
//   }

//   // delete with type-DELETE prompt
//   async function onDelete(id) {
//     const ans = prompt('Type DELETE to confirm permanent deletion');
//     if (ans !== 'DELETE') return;
//     try {
//       await deleteEvent(id);
//       if (editingId === id) setEditingId(null);
//       reload();
//     } catch {
//       alert('Delete failed');
//     }
//   }

//   // form field change
//   const onF = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
//   // slot field change
//   const onS = (i, key) => e => {
//     const cp = [...slots];
//     cp[i] = { ...cp[i], [key]: e.target.value };
//     setSlots(cp);
//   };

//   return (
//     <div className="admin-events">
//       <h1 className="page-title">Admin: Special Events</h1>

//       {/* ── Create / Edit Form ── */}
//       <section className="admin-form">
//         <div className="form-row">
//           {['name','date','description','capacity'].map((key,i) => (
//             <div className="input-group" key={i}>
//               <label htmlFor={`evt-${key}`}>
//                 {key.charAt(0).toUpperCase()+key.slice(1)}
//               </label>
//               <input
//                 id={`evt-${key}`}
//                 {...(key==='date'?{type:'date'}:{})}
//                 value={form[key]}
//                 onChange={onF(key)}
//               />
//             </div>
//           ))}
//         </div>

//         <div className="slots-section">
//           <h2>Slots</h2>
//           <div className="slots-table-wrapper">
//             <table className="slots-table">
//               <thead>
//                 <tr>
//                   <th>Officer</th>
//                   <th>Assignment</th>
//                   <th>Time In</th>
//                   <th>Time Out</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {slots.map((s,i) => (
//                   <tr key={i}>
//                     <td>
//                       {s.filled_name
//                         ? `${s.filled_name} (${s.filled_rank})`
//                         : '—'}
//                     </td>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="e.g. Gate"
//                         value={s.assignment}
//                         onChange={onS(i,'assignment')}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="0730"
//                         maxLength={4}
//                         value={s.time_in}
//                         onChange={onS(i,'time_in')}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="1600"
//                         maxLength={4}
//                         value={s.time_out}
//                         onChange={onS(i,'time_out')}
//                       />
//                     </td>
//                     <td className="col-action">
//                       <button
//                         type="button"
//                         className="btn-icon"
//                         onClick={() =>
//                           setSlots(slots.filter((_,j)=>j!==i))
//                         }
//                         aria-label="Delete slot"
//                       >🗑</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="form-controls">
//             <button
//               type="button"
//               className="btn-outline"
//               onClick={() =>
//                 setSlots([...slots,{
//                   id: null,filled_by:null,
//                   filled_name:'',filled_rank:'',
//                   assignment:'',time_in:'',time_out:''
//                 }])
//               }
//             >+ Add Slot</button>
//             <button
//               type="button"
//               className="btn-primary"
//               onClick={onSubmit}
//             >
//               {editingId ? 'Save Changes' : 'Publish Event'}
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ── Ongoing / Archived Toggle ── */}
//       <div className="toggle-container">
//         <button
//           className={`toggle-btn ${view==='ongoing'?'active':''}`}
//           onClick={()=>setView('ongoing')}
//         >
//           Ongoing
//         </button>
//         <button
//           className={`toggle-btn ${view==='archived'?'active':''}`}
//           onClick={()=>setView('archived')}
//         >
//           Archived
//         </button>
//       </div>

//       {/* ── Events Table ── */}
//       <div className="table-container">
//         <table className="events-table">
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Date</th>
//               <th>Capacity</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(ev => (
//               <tr key={ev.id}>
//                 <td>{ev.name}</td>
//                 <td>{formatDate(ev.date)}</td>
//                 <td>{ev.capacity}</td>
//                 <td>
//                   <button
//                     className="btn-edit"
//                     onClick={()=>startEdit(ev)}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     className="btn-delete"
//                     onClick={()=>onDelete(ev.id)}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//             {filtered.length===0 && (
//               <tr>
//                 <td colSpan="4" className="no-data">
//                   No {view} events
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <div className="sync-sheets">
//         <SyncSheetsButton />
//       </div>
//     </div>
//   );
// }

// src/pages/AdminEvents.jsx
import React, { useState, useEffect } from 'react';
import {
  listEvents,
  createEvent,
  addSlots,
  updateEvent,
  updateEventSlot,
  deleteEvent
} from '../api';
import SyncSheetsButton from '../components/SyncSheetsButton';
import { useNotifications } from '../contexts/NotificationsContext';
import './AdminEvents.css';

function formatDate(dateStr) {
  // dateStr is "YYYY-MM-DD"
  const [y, m, d] = dateStr.split('-');
  return `${m}/${d}/${y}`;
}

export default function AdminEvents() {
  const { addNotification } = useNotifications();

  // All events from the server
  const [events, setEvents] = useState([]);
  // 'ongoing' or 'archived'
  const [view, setView] = useState('ongoing');
  // currently editing event ID
  const [editingId, setEditingId] = useState(null);
  // form fields for event
  const [form, setForm] = useState({
    name: '',
    date: '',
    description: '',
    capacity: 0
  });
  // slots for the event being edited
  const [slots, setSlots] = useState([
    { id: null, filled_by: null, filled_name: '', filled_rank: '', assignment: '', time_in: '', time_out: '' }
  ]);

  // load all events once
  useEffect(() => {
    reload();
  }, []);

  function reload() {
    listEvents()
      .then(data => {
        // sort ascending by date
        const sorted = data.sort((a,b)=> a.date.localeCompare(b.date));
        setEvents(sorted);
      })
      .catch(() => alert('Could not load events'));
  }

  // helper: today in<x_bin_342>-MM-DD
  const today = new Date().toISOString().slice(0,10);

  // filter events based on view
  const filtered = events.filter(ev =>
    view === 'ongoing'
      ? ev.date >= today
      : ev.date < today
  );

  // start editing an event
  async function startEdit(ev) {
    setEditingId(ev.id);
    setForm({
      name: ev.name,
      date: ev.date,
      description: ev.description,
      capacity: ev.capacity
    });
    // fetch its slots
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/events/${ev.id}`,
      { headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    const data = await res.json();
    setSlots(
      data.slots.map(s => ({
        ...s,
        filled_name: s.filled_name||'',
        filled_rank: s.filled_rank||'',
      }))
    );
  }

  // create or update
  async function onSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.date) {
      return alert('Name & date required');
    }

    try {
      if (editingId) {
        await updateEvent(editingId, {
          name: form.name,
          date: form.date,
          description: form.description,
          capacity: form.capacity
        });
        await Promise.all(
          slots.map(s =>
            updateEventSlot(editingId, s.id, {
              assignment: s.assignment,
              time_in:    s.time_in,
              time_out:   s.time_out
            })
          )
        );
        alert('✅ Event updated');
      } else {
        const { id } = await createEvent({
          name: form.name,
          date: form.date,
          description: form.description,
          capacity: form.capacity
        });
        await addSlots(
          id,
          slots.map(s => ({
            assignment: s.assignment,
            time_in:    s.time_in,
            time_out:   s.time_out
          }))
        );
        alert('✅ Event published');
        addNotification({
          title: 'New Special Event Published',
          body: `${form.name} on ${formatDate(form.date)} has been created.`
        });
      }
      setEditingId(null);
      setForm({ name:'', date:'', description:'', capacity:0 });
      setSlots([{ id: null, filled_by: null, filled_name:'', filled_rank:'', assignment:'', time_in:'', time_out:'' }]);
      reload();
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.error || err.message));
    }
  }

  // delete with type-DELETE prompt
  async function onDelete(id) {
    const ans = prompt('Type DELETE to confirm permanent deletion');
    if (ans !== 'DELETE') return;
    try {
      await deleteEvent(id);
      if (editingId === id) setEditingId(null);
      reload();
    } catch {
      alert('Delete failed');
    }
  }

  const onF = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  const onS = (i, key) => e => {
    const cp = [...slots];
    cp[i] = { ...cp[i], [key]: e.target.value };
    setSlots(cp);
  };

  return (
    <div className="admin-events">
      <h1 className="page-title">Admin: Special Events</h1>

      <section className="admin-form">
        <div className="form-row">
          {['name','date','description','capacity'].map((key,i) => (
            <div className="input-group" key={i}>
              <label htmlFor={`evt-${key}`}>
                {key.charAt(0).toUpperCase()+key.slice(1)}
              </label>
              <input
                id={`evt-${key}`}
                {...(key==='date'?{type:'date'}:{})}
                value={form[key]}
                onChange={onF(key)}
              />
            </div>
          ))}
        </div>

        <div className="slots-section">
          <h2>Slots</h2>
          <div className="slots-table-wrapper">
            <table className="slots-table">
              <thead>
                <tr>
                  <th>Officer</th>
                  <th>Assignment</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {slots.map((s,i) => (
                  <tr key={i}>
                    <td data-label="Officer">
                      {s.filled_name
                        ? `${s.filled_name} (${s.filled_rank})`
                        : '—'}
                    </td>
                    <td data-label="Assignment">
                      <input
                        className="slot-input"
                        placeholder="e.g. Gate"
                        value={s.assignment}
                        onChange={onS(i,'assignment')}
                      />
                    </td>
                    <td data-label="Time In">
                      <input
                        className="slot-input"
                        placeholder="0730"
                        maxLength={4}
                        value={s.time_in}
                        onChange={onS(i,'time_in')}
                      />
                    </td>
                    <td data-label="Time Out">
                      <input
                        className="slot-input"
                        placeholder="1600"
                        maxLength={4}
                        value={s.time_out}
                        onChange={onS(i,'time_out')}
                      />
                    </td>
                    <td className="col-action">
                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() =>
                          setSlots(slots.filter((_,j)=>j!==i))
                        }
                        aria-label="Delete slot"
                      >🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="form-controls">
            <button
              type="button"
              className="btn-outline"
              onClick={() =>
                setSlots([...slots,{
                  id: null,filled_by:null,
                  filled_name:'',filled_rank:'',
                  assignment:'',time_in:'',time_out:''
                }])
              }
            >+ Add Slot</button>
            <button
              type="button"
              className="btn-primary"
              onClick={onSubmit}
            >
              {editingId ? 'Save Changes' : 'Publish Event'}
            </button>
          </div>
        </div>
      </section>

      <div className="toggle-container">
        <button
          className={`toggle-btn ${view==='ongoing'?'active':''}`}
          onClick={()=>setView('ongoing')}
        >
          Ongoing
        </button>
        <button
          className={`toggle-btn ${view==='archived'?'active':''}`}
          onClick={()=>setView('archived')}
        >
          Archived
        </button>
      </div>

      <div className="table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Capacity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ev => (
              <tr key={ev.id}>
                {/* ADDED data-label ATTRIBUTES TO THIS TABLE */}
                <td data-label="Name">{ev.name}</td>
                <td data-label="Date">{formatDate(ev.date)}</td>
                <td data-label="Capacity">{ev.capacity}</td>
                <td data-label="Actions" className="event-actions">
                  <button
                    className="btn-edit"
                    onClick={()=>startEdit(ev)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={()=>onDelete(ev.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length===0 && (
              <tr>
                <td colSpan="4" className="no-data">
                  No {view} events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sync-sheets">
        <SyncSheetsButton />
      </div>
    </div>
  );
}
