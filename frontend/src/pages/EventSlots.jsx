//-------------------------------------------------------------------
// // src/pages/EventSlots.jsx
// import React, {useEffect, useState} from 'react';
// import { useParams }               from 'react-router-dom';
// import { listSlots, claimSlot }    from '../api';

// export default function EventSlots() {
//   const { id } = useParams();
//   const [slots,   setSlots]   = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error,   setError]   = useState('');

//   useEffect(() => {
//     if (!id) {
//       setError('No event selected');
//       setLoading(false);
//       return;
//     }
//     listSlots(id)
//       .then(setSlots)
//       .catch(()=>setError('Could not load slots'))
//       .finally(()=>setLoading(false));
//   }, [id]);

//   if (loading) return <p>Loading…</p>;
//   if (error)   return <p style={{color:'red'}}>{error}</p>;
//   if (!slots.length) return <p>No slots available for this event.</p>;

//   return (
//     <div style={{padding:20}}>
//       <h1>Sign Up for Event #{id}</h1>
//       <table border="1" cellPadding="8">
//         <thead>
//           <tr><th>Assignment</th><th>Time In</th><th>Time Out</th><th>Action</th></tr>
//         </thead>
//         <tbody>
//           {slots.map(s => (
//             <tr key={s.id}>
//               <td>{s.assignment}</td>
//               <td>{s.time_in}</td>
//               <td>{s.time_out}</td>
//               <td>
//                 {s.filled_by
//                   ? <span>{s.filled_name}</span>
//                   : <button onClick={()=>
//                       claimSlot(id, s.id)
//                         .then(()=> {
//                           setSlots(slots.map(x =>
//                             x.id === s.id
//                               ? { ...x, filled_by: s.filled_by || true, filled_name: 'You' }
//                               : x
//                           ));
//                         })
//                         .catch(e=>alert(e.response?.data?.error||e.message))
//                     }>
//                     Sign Up
//                   </button>
//                 }
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

//--------------------------------------------------------------------
// /* src/pages/EventSlots.jsx */
// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom';
// import { listEvents, listSlots, claimSlot } from '../api';
// import './EventSlots.css';

// export default function EventSlots() {
//   const { id } = useParams();
//   const [event, setEvent] = useState(null);
//   const [slots, setSlots] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     if (!id) {
//       setError('No event selected');
//       setLoading(false);
//       return;
//     }

//     Promise.all([listEvents(), listSlots(id)])
//       .then(([all, slots]) => {
//         const ev = all.find(e => String(e.id) === id);
//         if (!ev) setError('Event not found');
//         else {
//           setEvent(ev);
//           setSlots(slots);
//         }
//       })
//       .catch(() => setError('Could not load event or slots'))
//       .finally(() => setLoading(false));
//   }, [id]);

//   if (loading) return <p className="loading">Loading…</p>;
//   if (error) return <p className="error">{error}</p>;

//   return (
//     <div className="event-slots-wrapper">
//       <section className="event-header">
//         <h1>{event.name}</h1>
//         <p className="desc">{event.description}</p>
//         <div className="meta">
//           <span>Date: {new Date(event.date).toLocaleDateString()}</span>
//           <span>Capacity: {event.capacity}</span>
//         </div>
//       </section>
//       {slots.length === 0 ? (
//         <p className="empty">No slots available.</p>
//       ) : (
//         <table className="slots-table">
//           <thead>
//             <tr>
//               <th>Assignment</th>
//               <th>Time In</th>
//               <th>Time Out</th>
//               <th>Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {slots.map(s => (
//               <tr key={s.id}>
//                 <td>{s.assignment}</td>
//                 <td>{s.time_in}</td>
//                 <td>{s.time_out}</td>
//                 <td>
//                   {s.filled_by ? (
//                     <button className="btn filled" disabled>
//                       Assigned to {s.filled_name}
//                     </button>
//                   ) : (
//                     <button
//                       className="btn"
//                       onClick={() =>
//                         claimSlot(id, s.id)
//                           .then(() =>
//                             setSlots(prev =>
//                               prev.map(x =>
//                                 x.id === s.id
//                                   ? { ...x, filled_by: true, filled_name: 'You' }
//                                   : x
//                               )
//                             )
//                           )
//                           .catch(e => alert(e.response?.data?.error || e.message))
//                       }
//                     >
//                       Sign Up
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// }


/* src/pages/EventSlots.jsx */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { listEvents, listSlots, claimSlot } from '../api';
import './EventSlots.css';

export default function EventSlots() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No event selected');
      setLoading(false);
      return;
    }

    Promise.all([listEvents(), listSlots(id)])
      .then(([all, slotsData]) => {
        const ev = all.find(e => String(e.id) === id);
        if (!ev) setError('Event not found');
        else {
          setEvent(ev);
          setSlots(slotsData);
        }
      })
      .catch(() => setError('Could not load event or slots'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="loading">Loading…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="event-slots-wrapper">
      <section className="event-header">
        <h1>{event.name}</h1>
        <p className="desc">{event.description}</p>
        <div className="meta">
          <span>Date: {new Date(event.date).toLocaleDateString()}</span>
          <span>Capacity: {event.capacity}</span>
        </div>
      </section>
      {slots.length === 0 ? (
        <p className="empty">No slots available.</p>
      ) : (
        <table className="slots-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(s => (
              <tr key={s.id}>
                <td>{s.assignment}</td>
                <td>{s.time_in}</td>
                <td>{s.time_out}</td>
                <td>
                  {s.filled_by ? (
                    <button className="btn filled" disabled>
                      Assigned to {s.filled_name}
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={() =>
                        claimSlot(id, s.id)
                          .then(() =>
                            setSlots(prev =>
                              prev.map(x =>
                                x.id === s.id
                                  ? { ...x, filled_by: true, filled_name: 'You' }
                                  : x
                              )
                            )
                          )
                          .catch(e => alert(e.response?.data?.error || e.message))
                      }
                    >
                      Sign Up
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}