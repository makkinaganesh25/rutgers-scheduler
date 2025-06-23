// // src/pages/Announcements.jsx
// import React, { useState, useEffect } from 'react';
// import { listAnnouncements } from '../api';
// import { FaPaperclip, FaCalendarAlt } from 'react-icons/fa';
// import './Announcements.css';

// export default function Announcements() {
//   const [anns, setAnns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selected, setSelected] = useState(null);

//   useEffect(() => {
//     listAnnouncements()
//       .then(data =>
//         setAnns(
//           data.sort(
//             (a, b) => new Date(b.created_at) - new Date(a.created_at)
//           )
//         )
//       )
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, []);

//   const closeModal = () => setSelected(null);

//   return (
//     <div className="announcements-page">
//       <h1 className="ann-header">📢 Latest Announcements</h1>

//       {loading ? (
//         <p className="ann-message">Loading…</p>
//       ) : anns.length === 0 ? (
//         <p className="ann-message">No announcements yet.</p>
//       ) : (
//         <div className="ann-table-wrapper">
//           <table className="ann-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>Posted</th>
//                 <th>Preview</th>
//               </tr>
//             </thead>
//             <tbody>
//               {anns.map(a => (
//                 <tr
//                   key={a.id}
//                   className="ann-row"
//                   onClick={() => setSelected(a)}
//                 >
//                   <td>{a.title}</td>
//                   <td>
//                     <FaCalendarAlt className="icon" />
//                     {new Date(a.created_at).toLocaleDateString()}{' '}
//                     {new Date(a.created_at).toLocaleTimeString()}
//                     {a.created_by_name && ` by ${a.created_by_name}`}
//                   </td>
//                   <td className="ann-preview">
//                     {a.body.length > 60
//                       ? a.body.slice(0, 57) + '…'
//                       : a.body}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {selected && (
//         <div className="modal-overlay" onClick={closeModal}>
//           <div
//             className="modal-content"
//             onClick={e => e.stopPropagation()}
//           >
//             <button className="modal-close" onClick={closeModal}>
//               &times;
//             </button>
//             <h2>{selected.title}</h2>
//             <p className="modal-meta">
//               <FaCalendarAlt className="icon" />
//               {new Date(selected.created_at).toLocaleDateString()} at{' '}
//               {new Date(selected.created_at).toLocaleTimeString()}
//               {selected.created_by_name &&
//                 ` by ${selected.created_by_name}`}
//             </p>
//             <div className="modal-body">
//               {selected.body.split('\n').map((line, i) => (
//                 <p key={i}>{line}</p>
//               ))}
//             </div>
//             {selected.files.length > 0 && (
//               <div className="modal-files">
//                 <h3>
//                   <FaPaperclip className="icon" /> Attachments
//                 </h3>
//                 <ul>
//                   {selected.files.map(f => (
//                     <li key={f.id}>
//                       <a
//                         href={f.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {f.filename}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// import React, { useState, useEffect } from 'react';
// import { listAnnouncements } from '../api';
// import { FaPaperclip, FaCalendarAlt } from 'react-icons/fa';
// import './Announcements.css';

// export default function Announcements() {
//   const [anns, setAnns] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     listAnnouncements()
//       .then(data => setAnns(data.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at))))
//       .catch(console.error)
//       .finally(()=>setLoading(false));
//   }, []);

//   return (
//     <div className="announcements-page">
//       <h1>Latest Announcements</h1>
//       {loading ? (
//         <p>Loading…</p>
//       ) : anns.length===0 ? (
//         <p>No announcements yet.</p>
//       ) : (
//         <div className="ann-table-wrapper">
//           <table className="ann-table">
//             <thead>
//               <tr><th>Title</th><th>Posted</th><th>Preview</th></tr>
//             </thead>
//             <tbody>
//               {anns.map(a=>(
//                 <tr key={a.id} onClick={()=>window.location=`/announcements#${a.id}`}>
//                   <td>{a.title}</td>
//                   <td>
//                     <FaCalendarAlt/> {new Date(a.created_at).toLocaleString()}
//                   </td>
//                   <td>{a.body.length>60?a.body.slice(0,57)+'…':a.body}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }
//----------------------------------------------------------------------------------------------------------------
// // src/pages/Announcements.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   listAnnouncements,
//   starAnnouncement,
//   unstarAnnouncement
// } from '../api';
// import { FaStar, FaRegStar, FaCalendarAlt } from 'react-icons/fa';
// import './Announcements.css';

// export default function Announcements() {
//   const [anns, setAnns]         = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [onlyStarred, setOnly]  = useState(false);
//   const [selected, setSelected] = useState(null);

//   // fetch (and refetch on filter change)
//   useEffect(() => {
//     setLoading(true);
//     listAnnouncements({ starred: onlyStarred })
//       .then(data => setAnns(data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [onlyStarred]);

//   // toggle star w/o full refetch
//   const toggleStar = async a => {
//     try {
//       if (a.starred) await unstarAnnouncement(a.id);
//       else           await starAnnouncement(a.id);
//       setAnns(anns.map(x =>
//         x.id === a.id ? { ...x, starred: !x.starred } : x
//       ));
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <div className="announcements-page">
//       <h1>Announcements</h1>
//       <div className="ann-filter">
//         <label>
//           <input
//             type="checkbox"
//             checked={onlyStarred}
//             onChange={e => setOnly(e.target.checked)}
//           /> Show starred only
//         </label>
//       </div>

//       {loading
//         ? <p>Loading…</p>
//         : (
//           <div className="ann-table-wrapper">
//             <table className="ann-table">
//               <thead>
//                 <tr>
//                   <th></th>
//                   <th>Title</th>
//                   <th>Posted</th>
//                   <th>Preview</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {anns.length === 0 && (
//                   <tr>
//                     <td colSpan="4" style={{ textAlign:'center', padding:'1rem' }}>
//                       No announcements
//                     </td>
//                   </tr>
//                 )}
//                 {anns.map(a => (
//                   <tr key={a.id} onClick={() => setSelected(a)}>
//                     <td
//                       className="ann-star-cell"
//                       onClick={e => { e.stopPropagation(); toggleStar(a); }}
//                     >
//                       {a.starred
//                         ? <FaStar color="#f5c518" />
//                         : <FaRegStar />}
//                     </td>
//                     <td>{a.title}</td>
//                     <td>
//                       <FaCalendarAlt className="icon"/> 
//                       {new Date(a.created_at).toLocaleString()}
//                     </td>
//                     <td className="ann-preview">
//                       {a.body.length > 60
//                         ? a.body.slice(0,57) + '…'
//                         : a.body}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )
//       }

//       {selected && (
//         <div className="modal-overlay" onClick={() => setSelected(null)}>
//           <div className="modal-content" onClick={e => e.stopPropagation()}>
//             <button className="modal-close" onClick={() => setSelected(null)}>
//               &times;
//             </button>
//             <h2>{selected.title}</h2>
//             <p className="modal-meta">
//               <FaCalendarAlt className="icon"/> 
//               {new Date(selected.created_at).toLocaleString()}
//               {selected.created_by_name && ` by ${selected.created_by_name}`}
//             </p>
//             <div className="modal-body">
//               {selected.body.split('\n').map((line,i) => <p key={i}>{line}</p>)}
//             </div>
//             {selected.files.length > 0 && (
//               <div className="modal-files">
//                 <h3>Attachments</h3>
//                 <ul>
//                   {selected.files.map(f => (
//                     <li key={f.id}>
//                       <a href={f.url}
//                          target="_blank"
//                          rel="noopener noreferrer">
//                         {f.filename}
//                       </a>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

//-//--------------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
  listAnnouncements,
  starAnnouncement,
  unstarAnnouncement
} from '../api';
import {
  FaStar,
  FaRegStar,
  FaCalendarAlt
} from 'react-icons/fa';
import './Announcements.css';

export default function Announcements() {
  const [anns, setAnns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStarred, setFilterStarred] = useState(false);
  const [selected, setSelected] = useState(null);

  // Fetch announcements whenever filter changes
  useEffect(() => {
    setLoading(true);
    listAnnouncements({ starred: filterStarred })
      .then(data => setAnns(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filterStarred]);

  // Toggle a single announcement's star
  const toggleStar = async ann => {
    try {
      if (ann.starred) {
        await unstarAnnouncement(ann.id);
      } else {
        await starAnnouncement(ann.id);
      }
      // update local state
      setAnns(anns.map(a =>
        a.id === ann.id ? { ...a, starred: !a.starred } : a
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="announcements-page">
      <header className="ann-header-bar">
        <h1 className="ann-title">Announcements</h1>
        <button
          className={`ann-filter-btn ${filterStarred ? 'active' : ''}`}
          onClick={() => setFilterStarred(!filterStarred)}
        >
          {filterStarred ? '★ Show All' : '☆ Show Starred'}
        </button>
      </header>

      {loading
        ? <p className="ann-loading">Loading…</p>
        : anns.length === 0
          ? <p className="ann-empty">No announcements found.</p>
          : (
            <div className="ann-table-wrapper">
              <table className="ann-table">
                <thead>
                  <tr>
                    <th className="star-col"></th>
                    <th>Title</th>
                    <th>Posted</th>
                    <th>Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {anns.map(a => (
                    <tr
                      key={a.id}
                      className="ann-row"
                      onClick={() => setSelected(a)}
                    >
                      <td
                        className="star-col"
                        onClick={e => { e.stopPropagation(); toggleStar(a); }}
                      >
                        {a.starred
                          ? <FaStar className="star-icon starred" />
                          : <FaRegStar className="star-icon" />}
                      </td>
                      <td className="title-cell">{a.title}</td>
                      <td className="date-cell">
                        <FaCalendarAlt className="icon" />
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="preview-cell">
                        {a.body.length > 80
                          ? a.body.slice(0, 77) + '…'
                          : a.body}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      }

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-panel" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              ×
            </button>
            <h2 className="modal-title">{selected.title}</h2>
            <p className="modal-meta">
              <FaCalendarAlt className="icon" />
              {new Date(selected.created_at).toLocaleString()}
              {selected.created_by_name && ` by ${selected.created_by_name}`}
            </p>
            <div className="modal-body">
              {selected.body.split('\n').map((line, i) =>
                <p key={i}>{line}</p>
              )}
            </div>
            {selected.files && selected.files.length > 0 && (
              <div className="modal-files">
                <h3>Attachments</h3>
                <ul>
                  {selected.files.map(f => (
                    <li key={f.id}>
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.filename}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
