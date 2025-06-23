// // src/pages/AdminEvents.jsx
// import React, {useState, useEffect} from 'react';
// import { Link }                         from 'react-router-dom';
// import { listEvents, createEvent, addSlots } from '../api';
// import SyncSheetsButton                 from '../components/SyncSheetsButton';

// export default function AdminEvents() {
//   const [events, setEvents] = useState([]);
//   const [form,   setForm]   = useState({
//     name:'', date:'', description:'', capacity:0
//   });
//   const [slots, setSlots]   = useState([
//     { assignment:'', time_in:'', time_out:'' }
//   ]);

//   useEffect(() => {
//     listEvents().then(setEvents).catch(()=>alert('Could not load events'));
//   }, []);

//   const onF = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
//   const onS = (i, key) => e => {
//     const a = [...slots]; a[i][key] = e.target.value; setSlots(a);
//   };

//   const publish = async () => {
//     const { name, date, description, capacity } = form;
//     if (!name || !date || slots.length === 0) {
//       return alert('Fill name, date & ≥1 slot');
//     }
//     for (let s of slots) {
//       if (!/^\d{4}$/.test(s.time_in) || !/^\d{4}$/.test(s.time_out))
//         return alert('Times must be 4 digits');
//       if (!s.assignment.trim())
//         return alert('Assignment required');
//     }

//     try {
//       const { id } = await createEvent({ name, date, description, capacity });
//       await addSlots(id, slots.map(s => ({
//         assignment: s.assignment.trim(),
//         time_in:    s.time_in,
//         time_out:   s.time_out
//       })));
//       setEvents(ev => [...ev, { ...form, id }]);
//       setForm({ name:'', date:'', description:'', capacity:0 });
//       setSlots([{ assignment:'', time_in:'', time_out:'' }]);
//       alert('✅ Event published');
//     } catch (err) {
//       alert('Publish failed: ' + (err.response?.data?.error || err.message));
//     }
//   };

//   return (
//     <div style={{padding:20}}>
//       <h1>Admin: Special Events</h1>

//       <div>
//         <input placeholder="Name"        value={form.name}        onChange={onF('name')} />
//         <input type="date"               value={form.date}        onChange={onF('date')} />
//         <input placeholder="Description" value={form.description} onChange={onF('description')} />
//         <input type="number" placeholder="Capacity" value={form.capacity} onChange={onF('capacity')} />
//       </div>

//       <h3>Slots</h3>
//       <table>
//         <thead>
//           <tr><th>Assignment</th><th>In</th><th>Out</th><th/></tr>
//         </thead>
//         <tbody>
//           {slots.map((s,i) => (
//             <tr key={i}>
//               <td><input value={s.assignment} onChange={onS(i,'assignment')} /></td>
//               <td><input placeholder="0730" maxLength={4} value={s.time_in} onChange={onS(i,'time_in')} /></td>
//               <td><input placeholder="1600" maxLength={4} value={s.time_out} onChange={onS(i,'time_out')} /></td>
//               <td>
//                 <button onClick={()=>setSlots(ss=>ss.filter((_,j)=>j!==i))}>
//                   🗑
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//       <button onClick={()=>setSlots(ss=>[...ss,{assignment:'',time_in:'',time_out:''}])}>
//         + Add Slot
//       </button>
//       <button onClick={publish}>Publish Event</button>

//       <h2>Existing Events</h2>
//       <ul>
//         {events.map(ev => (
//           <li key={ev.id}>
//             <Link to={`/events/${ev.id}`}>
//               {ev.name} — {ev.date} (cap {ev.capacity})
//             </Link>
//           </li>
//         ))}
//       </ul>

//       <h2>Sync to Google Sheets</h2>
//       <SyncSheetsButton/>
//     </div>
//   );
// }
//--------------------------------------------------------------------------------------------------
// src/pages/AdminEvents.jsx
// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { listEvents, createEvent, addSlots } from '../api';
// import SyncSheetsButton from '../components/SyncSheetsButton';
// import { useNotifications } from '../contexts/NotificationsContext';
// import './AdminEvents.css';

// function formatDate(dateStr) {
//   // dateStr is "YYYY-MM-DD"
//   const [year, month, day] = dateStr.split('-');
//   return `${month}/${day}/${year}`;
// }

// export default function AdminEvents() {
//   const { addNotification } = useNotifications();

//   const [events, setEvents] = useState([]);
//   const [form, setForm] = useState({
//     name: '',
//     date: '',
//     description: '',
//     capacity: 0,
//   });
//   const [slots, setSlots] = useState([
//     { assignment: '', time_in: '', time_out: '' },
//   ]);

//   useEffect(() => {
//     listEvents()
//       .then(setEvents)
//       .catch(() => alert('Could not load events'));
//   }, []);

//   const onF = key => e =>
//     setForm(f => ({
//       ...f,
//       [key]: e.target.value,
//     }));

//   const onS = (i, key) => e => {
//     const copy = [...slots];
//     copy[i][key] = e.target.value;
//     setSlots(copy);
//   };

//   const publish = async () => {
//     const { name, date, description, capacity } = form;
//     if (!name || !date || !slots.length) {
//       return alert('Fill name, date & ≥1 slot');
//     }
//     for (let s of slots) {
//       if (!/^\d{4}$/.test(s.time_in) || !/^\d{4}$/.test(s.time_out)) {
//         return alert('Times must be 4 digits');
//       }
//       if (!s.assignment.trim()) {
//         return alert('Assignment required');
//       }
//     }

//     try {
//       const { id } = await createEvent({
//         name,
//         date,
//         description,
//         capacity,
//       });

//       await addSlots(
//         id,
//         slots.map(s => ({
//           assignment: s.assignment.trim(),
//           time_in: s.time_in,
//           time_out: s.time_out,
//         }))
//       );

//       const newEvent = { ...form, id };
//       setEvents(ev => [...ev, newEvent]);
//       setForm({ name: '', date: '', description: '', capacity: 0 });
//       setSlots([{ assignment: '', time_in: '', time_out: '' }]);
//       alert('✅ Event published');

//       // Fire notification for admins/users who have granted permission
//       addNotification({
//         title: 'New Special Event Published',
//         body: `${name} on ${formatDate(date)} has been created.`,
//       });
//     } catch (err) {
//       alert(
//         'Publish failed: ' +
//           (err.response?.data?.error || err.message)
//       );
//     }
//   };

//   return (
//     <div className="admin-events">
//       <h1 className="page-title">Admin: Special Events</h1>

//       <section className="admin-form">
//         <div className="form-row">
//           <div className="input-group">
//             <input
//               id="evt-name"
//               value={form.name}
//               onChange={onF('name')}
//               required
//             />
//             <label htmlFor="evt-name">Name</label>
//           </div>
//           <div className="input-group">
//             <input
//               id="evt-date"
//               type="date"
//               value={form.date}
//               onChange={onF('date')}
//               required
//             />
//             <label htmlFor="evt-date">Date</label>
//           </div>
//           <div className="input-group">
//             <input
//               id="evt-desc"
//               value={form.description}
//               onChange={onF('description')}
//             />
//             <label htmlFor="evt-desc">Description</label>
//           </div>
//           <div className="input-group">
//             <input
//               id="evt-cap"
//               type="number"
//               value={form.capacity}
//               min="0"
//               onChange={onF('capacity')}
//             />
//             <label htmlFor="evt-cap">Capacity</label>
//           </div>
//         </div>

//         <div className="slots-section">
//           <h2 className="section-title">Slots</h2>
//           <div className="slots-table-wrapper">
//             <table className="slots-table">
//               <thead>
//                 <tr>
//                   <th>Assignment</th>
//                   <th>Time In</th>
//                   <th>Time Out</th>
//                   <th className="col-action"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {slots.map((s, i) => (
//                   <tr key={i}>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="e.g. Gate"
//                         value={s.assignment}
//                         onChange={onS(i, 'assignment')}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="0730"
//                         maxLength={4}
//                         value={s.time_in}
//                         onChange={onS(i, 'time_in')}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         className="slot-input"
//                         placeholder="1600"
//                         maxLength={4}
//                         value={s.time_out}
//                         onChange={onS(i, 'time_out')}
//                       />
//                     </td>
//                     <td className="col-action">
//                       <button
//                         onClick={() =>
//                           setSlots(ss => ss.filter((_, j) => j !== i))
//                         }
//                         aria-label="Delete slot"
//                         className="btn-icon"
//                       >
//                         🗑
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="form-controls">
//             <button
//               className="btn btn-outline"
//               onClick={() =>
//                 setSlots(ss => [
//                   ...ss,
//                   { assignment: '', time_in: '', time_out: '' },
//                 ])
//               }
//             >
//               + Add Slot
//             </button>
//             <button className="btn btn-primary" onClick={publish}>
//               Publish Event
//             </button>
//           </div>
//         </div>
//       </section>

//       <section className="existing-events">
//         <h2 className="section-title">Existing Events</h2>
//         <div className="cards-grid">
//           {events.map(ev => (
//             <Link
//               to={`/events/${ev.id}`}
//               key={ev.id}
//               className="card"
//             >
//               <h3 className="card-title">{ev.name || '(no name)'}</h3>
//               <p className="card-date">
//                 {formatDate(ev.date)}
//               </p>
//               <p className="card-capacity">
//                 Capacity: {ev.capacity}
//               </p>
//             </Link>
//           ))}
//         </div>
//       </section>

//       <section className="sync-sheets">
//         <SyncSheetsButton />
//       </section>
//     </div>
//   );
// }

//---------------------------------------------------------------------------
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

// function formatDate(d) {
//   const [y, m, day] = d.split('-');
//   return `${m}/${day}/${y}`;
// }

// export default function AdminEvents() {
//   const { addNotification } = useNotifications();

//   const [events, setEvents]       = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [form, setForm]           = useState({
//     name: '', date: '', description: '', capacity: 0
//   });
//   const [slots, setSlots]         = useState([{ assignment:'', time_in:'', time_out:'' }]);

//   // reload event list
//   const reload = () =>
//     listEvents()
//       .then(setEvents)
//       .catch(() => alert('Could not load events'));

//   // run reload once on mount
//   useEffect(() => {
//     reload();
//   }, []);

//   // start editing an existing event (load its slots too)
//   const startEdit = ev => {
//     setEditingId(ev.id);
//     setForm({
//       name: ev.name,
//       date: ev.date,
//       description: ev.description,
//       capacity: ev.capacity
//     });
//     fetch(`/api/events/${ev.id}`, {
//       headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
//     })
//       .then(r => r.json())
//       .then(data => setSlots(data.slots))
//       .catch(() => alert('Could not load event slots'));
//   };

//   // add or save
//   const onSubmit = async () => {
//     if (!form.name || !form.date) {
//       return alert('Name & date required');
//     }
//     try {
//       if (editingId) {
//         // update event meta
//         await updateEvent(editingId, form);
//         // update each slot
//         await Promise.all(slots.map(s =>
//           updateEventSlot(editingId, s.id, {
//             assignment: s.assignment,
//             time_in:    s.time_in,
//             time_out:   s.time_out
//           })
//         ));
//         alert('✅ Event updated');
//       } else {
//         // create new
//         const { id } = await createEvent(form);
//         await addSlots(id, slots);
//         alert('✅ Event published');
//         addNotification({
//           title: 'New Special Event',
//           body:  `${form.name} on ${formatDate(form.date)} created.`
//         });
//       }
//       // reset form
//       setEditingId(null);
//       setForm({ name:'', date:'', description:'', capacity:0 });
//       setSlots([{ assignment:'', time_in:'', time_out:'' }]);
//       reload();
//     } catch (err) {
//       alert('Save failed: ' + (err.message || err));
//     }
//   };

//   // delete entire event
//   const onDelete = id => {
//     if (!window.confirm('Delete entire event?')) return;
//     deleteEvent(id).then(() => {
//       if (editingId === id) setEditingId(null);
//       reload();
//     });
//   };

//   // form field handlers
//   const onF = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
//   const onS = (i, key) => e => {
//     const a = [...slots];
//     a[i][key] = e.target.value;
//     setSlots(a);
//   };

//   return (
//     <div className="admin-events">
//       <h1 className="page-title">Admin: Special Events</h1>

//       {/* Create / Edit Form */}
//       <section className="admin-form">
//         <div className="form-row">
//           {['name','date','description','capacity'].map((key,i) => (
//             <div className="input-group" key={i}>
//               <input
//                 id={`evt-${key}`}
//                 {...(key==='date'?{type:'date'}:{})}
//                 value={form[key]}
//                 onChange={onF(key)}
//                 placeholder=" "
//               />
//               <label htmlFor={`evt-${key}`}>
//                 {key.charAt(0).toUpperCase()+key.slice(1)}
//               </label>
//             </div>
//           ))}
//         </div>

//         <div className="slots-section">
//           <h2 className="section-title">Slots</h2>
//           <div className="slots-table-wrapper">
//             <table className="slots-table">
//               <thead>
//                 <tr>
//                   <th>Assignment</th>
//                   <th>Time In</th>
//                   <th>Time Out</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {slots.map((s,i) => (
//                   <tr key={i}>
//                     {['assignment','time_in','time_out'].map((k,j) => (
//                       <td key={j}>
//                         <input
//                           className="slot-input"
//                           value={s[k] || ''}
//                           onChange={onS(i,k)}
//                         />
//                       </td>
//                     ))}
//                     <td>
//                       <button
//                         className="btn-icon"
//                         onClick={() =>
//                           setSlots(slots.filter((_,idx) => idx!==i))
//                         }
//                       >🗑</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className="form-controls">
//             <button
//               className="btn btn-outline"
//               onClick={() =>
//                 setSlots([...slots, { assignment:'', time_in:'', time_out:'' }])
//               }
//             >+ Add Slot</button>
//             <button className="btn btn-primary" onClick={onSubmit}>
//               {editingId ? 'Save Changes' : 'Publish Event'}
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Existing Events */}
//       <section className="existing-events">
//         <h2 className="section-title">Existing Events</h2>
//         <div className="cards-grid">
//           {events.map(ev => (
//             <div className="card" key={ev.id}>
//               <h3 className="card-title">{ev.name}</h3>
//               <p className="card-date">{formatDate(ev.date)}</p>
//               <p className="card-capacity">Capacity: {ev.capacity}</p>
//               <div className="card-actions">
//                 <button onClick={()=>startEdit(ev)}>Edit</button>
//                 <button onClick={()=>onDelete(ev.id)}>Delete</button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       <SyncSheetsButton className="sync-sheets" />
//     </div>
//   );
// }

//----------------------------------------------------------------------------

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

  // helper: today in YYYY-MM-DD
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
    // fetch its slots (with filled_name & filled_rank via updated backend)
    const res = await fetch(
      `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}/api/events/${ev.id}`,
      { headers:{ Authorization: `Bearer ${localStorage.getItem('token')}` } }
    );
    const data = await res.json();
    setSlots(
      data.slots.map(s => ({
        ...s,
        // ensure all keys exist
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
        // update each existing slot
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
      // reset & reload
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

  // form field change
  const onF = key => e => setForm(f => ({ ...f, [key]: e.target.value }));
  // slot field change
  const onS = (i, key) => e => {
    const cp = [...slots];
    cp[i] = { ...cp[i], [key]: e.target.value };
    setSlots(cp);
  };

  return (
    <div className="admin-events">
      <h1 className="page-title">Admin: Special Events</h1>

      {/* ── Create / Edit Form ── */}
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
                    <td>
                      {s.filled_name
                        ? `${s.filled_name} (${s.filled_rank})`
                        : '—'}
                    </td>
                    <td>
                      <input
                        className="slot-input"
                        placeholder="e.g. Gate"
                        value={s.assignment}
                        onChange={onS(i,'assignment')}
                      />
                    </td>
                    <td>
                      <input
                        className="slot-input"
                        placeholder="0730"
                        maxLength={4}
                        value={s.time_in}
                        onChange={onS(i,'time_in')}
                      />
                    </td>
                    <td>
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

      {/* ── Ongoing / Archived Toggle ── */}
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

      {/* ── Events Table ── */}
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
                <td>{ev.name}</td>
                <td>{formatDate(ev.date)}</td>
                <td>{ev.capacity}</td>
                <td>
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
