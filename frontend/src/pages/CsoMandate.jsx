// import React, { useEffect, useState } from 'react';
// import {
//   getShifts,
//   listEvents,
//   getCsoMandateAvailability,
//   postCsoMandate
// } from '../api';
// import './CsoMandate.css';

// export default function CsoMandate() {
//   const [scenario, setScenario] = useState('leave');
//   const [dateFrom, setDateFrom] = useState('');
//   const [dateTo,   setDateTo]   = useState('');
//   const [shifts,   setShifts]   = useState([]);
//   const [events,   setEvents]   = useState([]);
//   const [slots,    setSlots]    = useState([]);
//   const [sel,      setSel]      = useState({
//     shiftId: null,
//     eventId: null,
//     slotId: null,
//     officerId: null
//   });
//   const [officers, setOfficers] = useState([]);
//   const [reason,   setReason]   = useState('');
//   const [error,    setError]    = useState('');
//   const [success,  setSuccess]  = useState('');

//   // load events once
//   useEffect(() => {
//     listEvents().then(setEvents).catch(console.error);
//   }, []);

//   // when leave + date range → filter open shifts
//   useEffect(() => {
//     if (scenario==='leave' && dateFrom && dateTo) {
//       getShifts().then(all=>{
//         setShifts(all.filter(s=>
//           !s.slot_id &&
//           s.status==='open' &&
//           s.date>=dateFrom &&
//           s.date<=dateTo
//         ));
//       });
//     }
//   }, [scenario, dateFrom, dateTo]);

//   // when event chosen → fetch ONLY unfilled slots
//   useEffect(() => {
//     if (scenario==='event' && sel.eventId) {
//       fetch(`${process.env.REACT_APP_API_BASE_URL||'http://localhost:5001'}` +
//             `/api/events/${sel.eventId}/slots`,
//         { headers:{ Authorization:`Bearer ${localStorage.getItem('token')}` } }
//       )
//       .then(r=>r.json())
//       .then(raw=> setSlots(raw.filter(s=>s.filled_by===null)))
//       .catch(console.error);
//     } else {
//       setSlots([]);
//     }
//   }, [scenario, sel.eventId]);

//   // whenever shiftId or slotId changes → fetch availability
//   useEffect(() => {
//     setOfficers([]);
//     if (scenario==='leave' && sel.shiftId) {
//       getCsoMandateAvailability({ shiftId:sel.shiftId })
//         .then(setOfficers)
//         .catch(()=>setOfficers([]));
//     }
//     if (scenario==='event' && sel.slotId) {
//       getCsoMandateAvailability({ slotId:sel.slotId })
//         .then(setOfficers)
//         .catch(()=>setOfficers([]));
//     }
//   }, [scenario, sel.shiftId, sel.slotId]);

//   async function handleMandate(e) {
//     e.preventDefault();
//     setError(''); setSuccess('');

//     const payload = { officerId: Number(sel.officerId), reason };
//     if (scenario==='leave')      payload.shiftId = Number(sel.shiftId);
//     else /* event */             payload.slotId  = Number(sel.slotId);

//     try {
//       await postCsoMandate(payload);
//       setSuccess('Shift mandated successfully!');
//       setSel({ shiftId:null, eventId:null, slotId:null, officerId:null });
//       setReason('');
//       setOfficers([]);
//     } catch (err) {
//       setError(err.response?.data?.error || 'Server error');
//     }
//   }

//   return (
//     <div className="cso-mandate-page">
//       <h2>Mandate CSO Shift</h2>
//       {error   && <div className="error">{error}</div>}
//       {success && <div className="success">{success}</div>}

//       <form className="cso-mandate-form" onSubmit={handleMandate}>
//         <label>
//           Scenario
//           <select
//             value={scenario}
//             onChange={e=>{
//               setScenario(e.target.value);
//               setSel({ shiftId:null, eventId:null, slotId:null, officerId:null });
//               setOfficers([]);
//             }}
//           >
//             <option value="leave">Leave Replacement</option>
//             <option value="event">Special-Event Slot</option>
//           </select>
//         </label>

//         {scenario==='leave' && (
//           <>
//             <label>
//               From
//               <input
//                 type="date"
//                 value={dateFrom}
//                 onChange={e=>setDateFrom(e.target.value)}
//                 required
//               />
//             </label>
//             <label>
//               To
//               <input
//                 type="date"
//                 value={dateTo}
//                 onChange={e=>setDateTo(e.target.value)}
//                 required
//               />
//             </label>
//             <label>
//               Open Shift
//               <select
//                 value={sel.shiftId||''}
//                 onChange={e=>setSel({...sel, shiftId:e.target.value})}
//                 required
//               >
//                 <option value="">— select —</option>
//                 {shifts.map(s=>(
//                   <option key={s.id} value={s.id}>
//                     {s.shift_type} {s.date} {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </>
//         )}

//         {scenario==='event' && (
//           <>
//             <label>
//               Event
//               <select
//                 value={sel.eventId||''}
//                 onChange={e=>{
//                   setSel({...sel, eventId:e.target.value, slotId:null, officerId:null});
//                   setOfficers([]);
//                 }}
//                 required
//               >
//                 <option value="">— select —</option>
//                 {events.map(ev=>(
//                   <option key={ev.id} value={ev.id}>
//                     {ev.name} ({ev.date})
//                   </option>
//                 ))}
//               </select>
//             </label>
//             <label>
//               Event Slot
//               <select
//                 value={sel.slotId||''}
//                 onChange={e=>setSel({...sel, slotId:e.target.value})}
//                 required
//               >
//                 <option value="">— select —</option>
//                 {slots.map(s=>(
//                   <option key={s.id} value={s.id}>
//                     {s.time_in}–{s.time_out} ({s.assignment})
//                   </option>
//                 ))}
//               </select>
//             </label>
//           </>
//         )}

//         <label>
//           Officer
//           <select
//             value={sel.officerId||''}
//             onChange={e=>setSel({...sel, officerId:e.target.value})}
//             required
//           >
//             <option value="">— select —</option>
//             {officers.map(o=>(
//               <option key={o.id} value={o.id}>
//                 {o.user_rank} {o.username}
//               </option>
//             ))}
//           </select>
//           {officers.length===0 && <small className="unavail">⚠ No available officers</small>}
//         </label>

//         <label>
//           Reason (optional)
//           <input
//             type="text"
//             value={reason}
//             onChange={e=>setReason(e.target.value)}
//           />
//         </label>

//         <button type="submit">Mandate Shift</button>
//       </form>
//     </div>
//   );
// }


import React, { useEffect, useState } from 'react';
import {
  getShifts,
  listEvents,
  getCsoMandateAvailability,
  postCsoMandate
} from '../api';
import './CsoMandate.css';

export default function CsoMandate() {
  const [scenario,  setScenario]  = useState('leave');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [shifts,    setShifts]    = useState([]);
  const [events,    setEvents]    = useState([]);
  const [slots,     setSlots]     = useState([]);
  const [selection, setSelection] = useState({
    shiftId:  null,
    eventId:  null,
    slotId:   null,
    officerId:null
  });
  const [officers,  setOfficers]  = useState([]);
  const [reason,    setReason]    = useState('');
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState('');

  // load events
  useEffect(() => {
    listEvents().then(setEvents).catch(console.error);
  }, []);

  // filter open shifts
  useEffect(() => {
    if (scenario === 'leave' && dateFrom && dateTo) {
      getShifts()
        .then(all => {
          const open = all.filter(s => {
            const d = s.date.slice(0, 10);
            return (
              s.status === 'open' &&
              d >= dateFrom &&
              d <= dateTo
            );
          });
          setShifts(open);
        })
        .catch(console.error);
    }
  }, [scenario, dateFrom, dateTo]);

  // load unfilled event slots
  useEffect(() => {
    if (scenario === 'event' && selection.eventId) {
      fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001'}` +
        `/api/events/${selection.eventId}/slots`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      )
        .then(r => r.json())
        .then(raw => setSlots(raw.filter(s => s.filled_by === null)))
        .catch(console.error);
    }
  }, [scenario, selection.eventId]);

  // fetch availability
  useEffect(() => {
    setOfficers([]);
    if (scenario === 'leave' && selection.shiftId) {
      getCsoMandateAvailability({ shiftId: selection.shiftId })
        .then(setOfficers)
        .catch(()=>setOfficers([]));
    }
    if (scenario === 'event' && selection.slotId) {
      getCsoMandateAvailability({ slotId: selection.slotId })
        .then(setOfficers)
        .catch(()=>setOfficers([]));
    }
  }, [scenario, selection.shiftId, selection.slotId]);

  // submit
  async function handleMandate(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    const payload = {
      officerId: Number(selection.officerId),
      reason
    };
    if (scenario === 'leave') payload.shiftId = Number(selection.shiftId);
    else                      payload.slotId  = Number(selection.slotId);

    try {
      await postCsoMandate(payload);
      setSuccess('Shift mandated successfully!');
      setSelection({ shiftId:null, eventId:null, slotId:null, officerId:null });
      setReason('');
      setOfficers([]);
    } catch (err) {
      setError(err.response?.data?.error || 'Server error');
    }
  }

  return (
    <div className="cso-mandate-page">
      <div className="card">
        <h2>Mandate CSO Shift</h2>
        {error   && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <form className="cso-mandate-form" onSubmit={handleMandate}>
          <label>
            Scenario
            <select
              value={scenario}
              onChange={e => {
                setScenario(e.target.value);
                setSelection({ shiftId:null, eventId:null, slotId:null, officerId:null });
                setOfficers([]);
              }}
            >
              <option value="leave">Leave Replacement</option>
              <option value="event">Special-Event Slot</option>
            </select>
          </label>

          <div className="section-divider" />

          {scenario === 'leave' && (
            <>
              <label>
                From
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  required
                />
              </label>

              <label>
                To
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  required
                />
              </label>

              <label>
                Open Shift
                <select
                  value={selection.shiftId || ''}
                  onChange={e => setSelection({ ...selection, shiftId: e.target.value })}
                  required
                >
                  <option value="">— select —</option>
                  {shifts.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.shift_type} {s.date.slice(0,10)} {s.start_time.slice(0,5)}–{s.end_time.slice(0,5)}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          {scenario === 'event' && (
            <>
              <label>
                Event
                <select
                  value={selection.eventId || ''}
                  onChange={e => {
                    setSelection({ eventId: e.target.value, slotId: null, officerId: null });
                    setOfficers([]);
                  }}
                  required
                >
                  <option value="">— select —</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.id}>
                      {ev.name} ({ev.date})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Event Slot
                <select
                  value={selection.slotId || ''}
                  onChange={e => setSelection({ ...selection, slotId: e.target.value })}
                  required
                >
                  <option value="">— select —</option>
                  {slots.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.time_in}–{s.time_out} ({s.assignment})
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}

          <div className="section-divider" />

          <label>
            Officer
            <select
              value={selection.officerId || ''}
              onChange={e => setSelection({ ...selection, officerId: e.target.value })}
              required
            >
              <option value="">— select —</option>
              {officers.map(o => (
                <option key={o.id} value={o.id}>
                  {o.first_name} ({o.username})
                </option>
              ))}
            </select>
            {officers.length === 0 && <small>⚠ No available officers</small>}
          </label>

          <label>
            Reason (optional)
            <textarea
              rows="2"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </label>

          <button type="submit">Mandate Shift</button>
        </form>
      </div>
    </div>
  );
}
