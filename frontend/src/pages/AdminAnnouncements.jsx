// // src/pages/AdminAnnouncements.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   listAnnouncements,
//   createAnnouncement,
//   updateAnnouncement,
//   deleteAnnouncement,
//   deleteAnnouncementFiles,
//   uploadAnnouncementFiles,
// } from '../api';
// import {
//   FaPaperclip,
//   FaPlus,
//   FaTimes,
//   FaEdit,
//   FaTrashAlt,
// } from 'react-icons/fa';
// import './AdminAnnouncements.css';

// export default function AdminAnnouncements() {
//   const [anns, setAnns] = useState([]);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({ title: '', body: '' });
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const fileRef = useRef();

//   useEffect(() => {
//     load();
//   }, []);

//   async function load() {
//     setLoading(true);
//     try {
//       const data = await listAnnouncements();
//       setAnns(data);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function startEdit(a) {
//     setEditing(a);
//     setForm({ title: a.title, body: a.body });
//     setFiles([]);
//     if (fileRef.current) fileRef.current.value = '';
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   }

//   function resetForm() {
//     setEditing(null);
//     setForm({ title: '', body: '' });
//     setFiles([]);
//     if (fileRef.current) fileRef.current.value = '';
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (submitting) return;
//     setSubmitting(true);
//     let id = editing?.id;
//     try {
//       if (editing) {
//         await updateAnnouncement(id, form);
//       } else {
//         const res = await createAnnouncement(form);
//         id = res.id;
//       }

//       if (files.length) {
//         // optional: clear old files on edit
//         if (editing && editing.files?.length) {
//           await deleteAnnouncementFiles(id);
//         }
//         const fd = new FormData();
//         files.forEach((f) => fd.append('files', f));
//         await uploadAnnouncementFiles(id, fd);
//       }

//       resetForm();
//       load();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleDelete(id) {
//     if (!window.confirm('Really delete this announcement?')) return;
//     await deleteAnnouncement(id);
//     load();
//   }

//   return (
//     <div className="admin-announcements-page">
//       <h1 className="aa-header">📰 Manage Announcements</h1>

//       <form className="aa-form" onSubmit={handleSubmit}>
//         <div className="aa-group">
//           <label>Title</label>
//           <input
//             type="text"
//             value={form.title}
//             onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
//             placeholder="Enter title"
//             required
//             disabled={submitting}
//           />
//         </div>
//         <div className="aa-group">
//           <label>Body</label>
//           <textarea
//             rows="4"
//             value={form.body}
//             onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
//             placeholder="Write the announcement..."
//             required
//             disabled={submitting}
//           />
//         </div>
//         <div className="aa-group">
//           <label>
//             <FaPaperclip /> Attachments
//           </label>
//           <input
//             type="file"
//             multiple
//             ref={fileRef}
//             onChange={(e) => setFiles(Array.from(e.target.files))}
//             disabled={submitting}
//           />
//           {files.length > 0 && (
//             <ul className="aa-file-list">
//               {files.map((f, i) => (
//                 <li key={i}>{f.name}</li>
//               ))}
//             </ul>
//           )}
//         </div>
//         <div className="aa-actions">
//           <button type="submit" className="aa-btn aa-btn-primary" disabled={submitting}>
//             {editing ? <><FaTimes /> Update</> : <><FaPlus /> Create</>}
//           </button>
//           {editing && (
//             <button type="button" className="aa-btn aa-btn-secondary" onClick={resetForm} disabled={submitting}>
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       <h2 className="aa-list-header">Existing Announcements</h2>
//       {loading ? (
//         <p>Loading…</p>
//       ) : (
//         <div className="aa-table-wrapper">
//           <table className="aa-table">
//             <thead>
//               <tr>
//                 <th>Title</th>
//                 <th>By</th>
//                 <th>Date</th>
//                 <th>Body</th>
//                 <th>Files</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {anns.map((a) => (
//                 <tr key={a.id}>
//                   <td>{a.title}</td>
//                   <td>{a.created_by_name}</td>
//                   <td>{new Date(a.created_at).toLocaleDateString()}</td>
//                   <td className="aa-body-cell">
//                     {a.body.length > 60 ? a.body.slice(0, 57) + '…' : a.body}
//                   </td>
//                   <td className="aa-files-cell">
//                     {a.files.map((f) => (
//                       <a
//                         key={f.id}
//                         href={f.url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                       >
//                         {f.filename}
//                       </a>
//                     ))}
//                   </td>
//                   <td className="aa-action-cell">
//                     <button onClick={() => startEdit(a)} className="aa-btn aa-btn-edit">
//                       <FaEdit /> Edit
//                     </button>
//                     <button onClick={() => handleDelete(a.id)} className="aa-btn aa-btn-delete">
//                       <FaTrashAlt /> Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// }


import React, { useState, useEffect, useRef } from 'react';
import {
  listAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  deleteAnnouncementFiles,
  uploadAnnouncementFiles,
} from '../api';
import { FaPaperclip, FaPlus, FaTimes, FaEdit, FaTrashAlt } from 'react-icons/fa';
import './AdminAnnouncements.css';

export default function AdminAnnouncements() {
  const [anns, setAnns] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', body: '' });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef();

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const data = await listAnnouncements();
    setAnns(data);
    setLoading(false);
  }

  function startEdit(a) {
    setEditing(a);
    setForm({ title: a.title, body: a.body });
    setFiles([]);
    fileRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    setEditing(null);
    setForm({ title: '', body: '' });
    setFiles([]);
    fileRef.current.value = '';
  }

  async function save(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    let id = editing?.id;
    try {
      if (editing) {
        await updateAnnouncement(id, { ...form, replaceFiles: !!files.length });
      } else {
        const { id: newId } = await createAnnouncement(form);
        id = newId;
      }
      if (files.length) {
        if (editing) await deleteAnnouncementFiles(id);
        const fd = new FormData();
        files.forEach(f => fd.append('files', f));
        await uploadAnnouncementFiles(id, fd);
      }
      reset();
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this announcement?')) return;
    await deleteAnnouncement(id);
    load();
  }

  return (
    <div className="admin-announcements-page">
      <h1>Manage Announcements</h1>

      <form className="aa-form" onSubmit={save}>
        <div className="aa-group">
          <label>Title</label>
          <input
            type="text" value={form.title}
            onChange={e=>setForm(f=>({...f,title:e.target.value}))}
            required disabled={submitting}
          />
        </div>
        <div className="aa-group">
          <label>Body</label>
          <textarea
            rows="4" value={form.body}
            onChange={e=>setForm(f=>({...f,body:e.target.value}))}
            required disabled={submitting}
          />
        </div>
        <div className="aa-group">
          <label><FaPaperclip/> Attachments</label>
          <input
            type="file" multiple ref={fileRef}
            onChange={e=>setFiles(Array.from(e.target.files))}
            disabled={submitting}
          />
          {files.length>0 && (
            <ul className="aa-file-list">
              {files.map((f,i)=><li key={i}>{f.name}</li>)}
            </ul>
          )}
        </div>
        <div className="aa-actions">
          <button type="submit" className="aa-btn aa-btn-primary" disabled={submitting}>
            {editing ? <><FaTimes/> Update</> : <><FaPlus/> Create</>}
          </button>
          {editing && (
            <button type="button" className="aa-btn aa-btn-secondary" onClick={reset} disabled={submitting}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2>Existing Announcements</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="aa-table-wrapper">
          <table className="aa-table">
            <thead>
              <tr>
                <th>Title</th><th>By</th><th>Date</th><th>Preview</th><th>Files</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {anns.map(a=>(
                <tr key={a.id}>
                  <td>{a.title}</td>
                  <td>{a.created_by_name}</td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>{a.body.length>60 ? a.body.slice(0,57)+'…' : a.body}</td>
                  <td className="aa-files-cell">
                    {a.files.map(f=>(
                      <a key={f.id} href={f.url} target="_blank" rel="noopener noreferrer">
                        {f.filename}
                      </a>
                    ))}
                  </td>
                  <td className="aa-action-cell">
                    <button onClick={()=>startEdit(a)} className="aa-btn aa-btn-edit"><FaEdit/></button>
                    <button onClick={()=>remove(a.id)} className="aa-btn aa-btn-delete"><FaTrashAlt/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
