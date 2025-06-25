// //-//--------------------------------------------------------------------
// import React, { useState, useEffect } from 'react';
// import {
//   listAnnouncements,
//   starAnnouncement,
//   unstarAnnouncement
// } from '../api';
// import {
//   FaStar,
//   FaRegStar,
//   FaCalendarAlt
// } from 'react-icons/fa';
// import './Announcements.css';

// export default function Announcements() {
//   const [anns, setAnns] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterStarred, setFilterStarred] = useState(false);
//   const [selected, setSelected] = useState(null);

//   // Fetch announcements whenever filter changes
//   useEffect(() => {
//     setLoading(true);
//     listAnnouncements({ starred: filterStarred })
//       .then(data => setAnns(data))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [filterStarred]);

//   // Toggle a single announcement's star
//   const toggleStar = async ann => {
//     try {
//       if (ann.starred) {
//         await unstarAnnouncement(ann.id);
//       } else {
//         await starAnnouncement(ann.id);
//       }
//       // update local state
//       setAnns(anns.map(a =>
//         a.id === ann.id ? { ...a, starred: !a.starred } : a
//       ));
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <div className="announcements-page">
//       <header className="ann-header-bar">
//         <h1 className="ann-title">Announcements</h1>
//         <button
//           className={`ann-filter-btn ${filterStarred ? 'active' : ''}`}
//           onClick={() => setFilterStarred(!filterStarred)}
//         >
//           {filterStarred ? '★ Show All' : '☆ Show Starred'}
//         </button>
//       </header>

//       {loading
//         ? <p className="ann-loading">Loading…</p>
//         : anns.length === 0
//           ? <p className="ann-empty">No announcements found.</p>
//           : (
//             <div className="ann-table-wrapper">
//               <table className="ann-table">
//                 <thead>
//                   <tr>
//                     <th className="star-col"></th>
//                     <th>Title</th>
//                     <th>Posted</th>
//                     <th>Preview</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {anns.map(a => (
//                     <tr
//                       key={a.id}
//                       className="ann-row"
//                       onClick={() => setSelected(a)}
//                     >
//                       <td
//                         className="star-col"
//                         onClick={e => { e.stopPropagation(); toggleStar(a); }}
//                       >
//                         {a.starred
//                           ? <FaStar className="star-icon starred" />
//                           : <FaRegStar className="star-icon" />}
//                       </td>
//                       <td className="title-cell">{a.title}</td>
//                       <td className="date-cell">
//                         <FaCalendarAlt className="icon" />
//                         {new Date(a.created_at).toLocaleString()}
//                       </td>
//                       <td className="preview-cell">
//                         {a.body.length > 80
//                           ? a.body.slice(0, 77) + '…'
//                           : a.body}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )
//       }

//       {selected && (
//         <div className="modal-overlay" onClick={() => setSelected(null)}>
//           <div className="modal-panel" onClick={e => e.stopPropagation()}>
//             <button className="modal-close" onClick={() => setSelected(null)}>
//               ×
//             </button>
//             <h2 className="modal-title">{selected.title}</h2>
//             <p className="modal-meta">
//               <FaCalendarAlt className="icon" />
//               {new Date(selected.created_at).toLocaleString()}
//               {selected.created_by_name && ` by ${selected.created_by_name}`}
//             </p>
//             <div className="modal-body">
//               {selected.body.split('\n').map((line, i) =>
//                 <p key={i}>{line}</p>
//               )}
//             </div>
//             {selected.files && selected.files.length > 0 && (
//               <div className="modal-files">
//                 <h3>Attachments</h3>
//                 <ul>
//                   {selected.files.map(f => (
//                     <li key={f.id}>
//                       <a href={f.url} target="_blank" rel="noopener noreferrer">
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
//--------------------------------------------------------------------------
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
          {filterStarred ? <FaStar /> : <FaRegStar />}
          <span className="filter-text">{filterStarred ? 'Show All' : 'Starred Only'}</span>
        </button>
      </header>

      {loading
        ? <p className="ann-loading">Loading…</p>
        : anns.length === 0
          ? <p className="ann-empty">No announcements found.</p>
          : (
            <>
              {/* --- Desktop Table (Will be hidden on mobile by CSS) --- */}
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

              {/* --- Mobile Card List (Will be hidden on desktop by CSS) --- */}
              <div className="ann-list-container">
                {anns.map(a => (
                  <div key={a.id} className="ann-card" onClick={() => setSelected(a)}>
                    <div className="ann-card-header">
                      <h2 className="ann-card-title">{a.title}</h2>
                      <button
                        className="star-btn"
                        onClick={e => { e.stopPropagation(); toggleStar(a); }}
                      >
                        {a.starred
                          ? <FaStar className="star-icon starred" />
                          : <FaRegStar className="star-icon" />}
                      </button>
                    </div>
                    <p className="ann-card-preview">{a.body}</p>
                    <div className="ann-card-footer">
                      <FaCalendarAlt className="icon" />
                      <span>{new Date(a.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
