// import React, { useState, useEffect } from 'react';
// import {
//   getAdminUsers,
//   createAdminUser,
//   updateAdminUser,
//   deleteAdminUser
// } from '../api';
// import { FaCheck, FaTimes } from 'react-icons/fa';
// import './AdminUsers.css';


// export default function AdminUsers() {
//   const [users, setUsers]     = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [filter, setFilter]   = useState('active'); // 'active' | 'inactive'
//   const [form, setForm]       = useState({
//     username: '', password: '', first_name: '',
//     email: '', phone: '', user_rank: '', manager_id: '',
//     active: true,
//   });

//   // Load users when filter changes
//   const load = async () => {
//     setLoading(true);
//     try {
//       const all = await getAdminUsers(filter === 'inactive');
//       setUsers(
//         filter === 'inactive'
//           ? all.filter(u => !u.active)
//           : all.filter(u => u.active)
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // we deliberately omit `load` here; it’s stable enough for our use
//   /* eslint-disable-next-line react-hooks/exhaustive-deps */
//   useEffect(() => {
//     load();
//   }, [filter]);

//   const onChange = e => {
//     const { name, value, type, checked } = e.target;
//     setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
//   };

//   const cancelEdit = () => {
//     setEditing(null);
//     setForm({
//       username: '', password: '', first_name: '',
//       email: '', phone: '', user_rank: '', manager_id: '',
//       active: true,
//     });
//   };

//   const onSubmit = async e => {
//     e.preventDefault();
//     try {
//       if (editing) {
//         await updateAdminUser(editing.id, form);
//       } else {
//         await createAdminUser(form);
//       }
//       load();
//       window.dispatchEvent(new Event('hierarchyUpdated'));
//       cancelEdit();
//     } catch (err) {
//       alert(err.response?.data?.error || 'Save failed');
//     }
//   };

//   const startEdit = u => {
//     setEditing(u);
//     setForm({
//       username:   u.username,
//       password:   '',
//       first_name: u.first_name,
//       email:      u.email,
//       phone:      u.phone,
//       user_rank:  u.user_rank,
//       manager_id: u.manager_id || '',
//       active:     u.active,
//     });
//   };

//   const onDelete = async id => {
//     if (!window.confirm('Delete this user?')) return;
//     await deleteAdminUser(id);
//     load();
//     window.dispatchEvent(new Event('hierarchyUpdated'));
//   };

//   return (
//     <div className="AdminUsers">
//       <h2>User Management</h2>

//       <form className="user-form" onSubmit={onSubmit}>
//         {/* Username */}
//         <div>
//           <label>Username</label>
//           <input
//             name="username"
//             value={form.username}
//             onChange={onChange}
//             required
//             disabled={!!editing}
//           />
//         </div>

//         {/* Password */}
//         {!editing && (
//           <div>
//             <label>Password</label>
//             <input
//               name="password"
//               type="password"
//               value={form.password}
//               onChange={onChange}
//               required
//             />
//           </div>
//         )}

//         {/* Full Name */}
//         <div>
//           <label>Full Name</label>
//           <input
//             name="first_name"
//             value={form.first_name}
//             onChange={onChange}
//             required
//           />
//         </div>

//         {/* Email */}
//         <div>
//           <label>Email</label>
//           <input
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={onChange}
//           />
//         </div>

//         {/* Phone */}
//         <div>
//           <label>Phone</label>
//           <input
//             name="phone"
//             value={form.phone}
//             onChange={onChange}
//           />
//         </div>

//         {/* Role */}
//         <div>
//           <label>Role</label>
//           <select
//             name="user_rank"
//             value={form.user_rank}
//             onChange={onChange}
//             required
//           >
//             <option value="">— Select —</option>
//             <option value="CDT">CDT</option>
//             <option value="CSO">CSO</option>
//             <option value="FTO">FTO</option>
//             <option value="XO">XO</option>
//             <option value="CS">CS</option>
//             <option value="BS">BS</option>
//             <option value="LT">LT</option>
//           </select>
//         </div>

//         {/* Supervisor */}
//         <div>
//           <label>Supervisor</label>
//           <select
//             name="manager_id"
//             value={form.manager_id || ''}
//             onChange={onChange}
//           >
//             <option value="">— None —</option>
//             {users.map(u => (
//               <option key={u.id} value={u.id}>
//                 {u.username}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Active? */}
//         <div className="checkbox">
//           <label>Active?</label>
//           <input
//             name="active"
//             type="checkbox"
//             checked={form.active}
//             onChange={onChange}
//           />
//         </div>

//         {/* Buttons */}
//         <div className="buttons">
//           <button type="submit">{editing ? 'Update' : 'Add'}</button>
//           {editing && (
//             <button type="button" onClick={cancelEdit}>
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       {/* Table */}
//       {loading ? (
//         <p>Loading…</p>
//       ) : (
//         <table className="users-table">
//           <thead>
//             <tr>
//               <th>#</th>
//               <th>Username</th>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Role</th>
//               <th>Mgr</th>
//               <th
//                 className="toggle-header"
//                 onClick={() =>
//                   setFilter(f => (f === 'active' ? 'inactive' : 'active'))
//                 }
//                 title="Toggle Active/Inactive"
//               >
//                 <span className="toggle-pill">
//                   {filter === 'active' ? <>Active <FaCheck/></> : <>Inactive <FaTimes/></>}
//                 </span>
//               </th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {users.map((u, i) => (
//               <tr key={u.id}>
//                 <td>{i + 1}</td>
//                 <td>{u.username}</td>
//                 <td>{u.first_name}</td>
//                 <td>{u.email}</td>
//                 <td>{u.user_rank}</td>
//                 <td>{u.manager_id || '—'}</td>
//                 <td>{u.active ? 'Yes' : 'No'}</td>
//                 <td>
//                   <button onClick={() => startEdit(u)}>Edit</button>
//                   <button onClick={() => onDelete(u.id)}>Delete</button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
// );
// }


import React, { useState, useEffect } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './AdminUsers.css';


export default function AdminUsers() {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter]   = useState('active'); // 'active' | 'inactive'
  const [form, setForm]       = useState({
    username: '', password: '', first_name: '',
    email: '', phone: '', user_rank: '', manager_id: '',
    active: true,
  });

  // Load users when filter changes
  const load = async () => {
    setLoading(true);
    try {
      const all = await getAdminUsers(true); // Always fetch all to get manager list
      setUsers(all);
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    load();
  }, []);

  const onChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm({
      username: '', password: '', first_name: '',
      email: '', phone: '', user_rank: '', manager_id: '',
      active: true,
    });
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      if (editing) {
        await updateAdminUser(editing.id, form);
      } else {
        await createAdminUser(form);
      }
      load();
      window.dispatchEvent(new Event('hierarchyUpdated'));
      cancelEdit();
    } catch (err) {
      alert(err.response?.data?.error || 'Save failed');
    }
  };

  const startEdit = u => {
    setEditing(u);
    setForm({
      username:   u.username,
      password:   '',
      first_name: u.first_name,
      email:      u.email,
      phone:      u.phone,
      user_rank:  u.user_rank,
      manager_id: u.manager_id || '',
      active:     u.active,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onDelete = async id => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    await deleteAdminUser(id);
    load();
    window.dispatchEvent(new Event('hierarchyUpdated'));
  };
  
  const supervisors = users.filter(u => u.user_rank !== 'CSO' && u.user_rank !== 'CDT');
  const displayedUsers = users.filter(u => filter === 'active' ? u.active : !u.active);

  return (
    <div className="AdminUsers">
      <h2>User Management</h2>

      <form className="user-form" onSubmit={onSubmit}>
        <div className="form-title">{editing ? `Editing: ${editing.username}` : 'Add New User'}</div>
        
        <div>
          <label>Username</label>
          <input name="username" value={form.username} onChange={onChange} required disabled={!!editing} />
        </div>
        
        {!editing && (
          <div>
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={onChange} required />
          </div>
        )}
        
        <div>
          <label>Full Name</label>
          <input name="first_name" value={form.first_name} onChange={onChange} required />
        </div>
        
        <div>
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={onChange} />
        </div>
        
        <div>
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={onChange} />
        </div>
        
        <div>
          <label>Role</label>
          <select name="user_rank" value={form.user_rank} onChange={onChange} required>
            <option value="">— Select —</option>
            <option value="CDT">CDT</option>
            <option value="CSO">CSO</option>
            <option value="FTO">FTO</option>
            <option value="XO">XO</option>
            <option value="CS">CS</option>
            <option value="BS">BS</option>
            <option value="LT">LT</option>
          </select>
        </div>
        
        <div>
          <label>Supervisor</label>
          <select name="manager_id" value={form.manager_id || ''} onChange={onChange}>
            <option value="">— None —</option>
            {supervisors.map(u => (
              <option key={u.id} value={u.id}>{u.first_name} ({u.username})</option>
            ))}
          </select>
        </div>
        
        <div className="checkbox-area">
          <label htmlFor="active-checkbox">Active</label>
          <input id="active-checkbox" name="active" type="checkbox" checked={form.active} onChange={onChange} />
        </div>
        
        <div className="buttons-area">
          <button type="submit" className="btn-primary">{editing ? 'Update User' : 'Add User'}</button>
          {editing && (
            <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
          )}
        </div>
      </form>

      {loading ? (
        <p>Loading users…</p>
      ) : (
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Mgr ID</th>
                <th
                  className="toggle-header"
                  onClick={() => setFilter(f => (f === 'active' ? 'inactive' : 'active'))}
                  title="Toggle Active/Inactive"
                >
                  <span className="toggle-pill">
                    {filter === 'active' ? <>Active <FaCheck/></> : <>Inactive <FaTimes/></>}
                  </span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedUsers.map((u, i) => (
                <tr key={u.id}>
                  <td data-label="#">{i + 1}</td>
                  <td data-label="Username">{u.username}</td>
                  <td data-label="Name">{u.first_name}</td>
                  <td data-label="Email">{u.email}</td>
                  <td data-label="Role">{u.user_rank}</td>
                  <td data-label="Mgr ID">{u.manager_id || '—'}</td>
                  <td data-label="Active">{u.active ? 'Yes' : 'No'}</td>
                  <td data-label="Actions">
                    <div className="action-buttons">
                        <button className="btn-edit" onClick={() => startEdit(u)}>Edit</button>
                        <button className="btn-delete" onClick={() => onDelete(u.id)}>Delete</button>
                    </div>
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
