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
//   const [users, setUsers]       = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [filter, setFilter]   = useState('active'); // 'active' | 'inactive'
//   const [form, setForm]       = useState({
//     username: '', password: '', first_name: '',
//     email: '', phone: '', user_rank: '', manager_id: '',
//     active: true,
//   });

//   const load = async () => {
//     setLoading(true);
//     try {
//       const all = await getAdminUsers(true);
//       setUsers(all);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

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
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };

//   const onDelete = async id => {
//     if (!window.confirm('Delete this user? This action cannot be undone.')) return;
//     await deleteAdminUser(id);
//     load();
//     window.dispatchEvent(new Event('hierarchyUpdated'));
//   };
  
//   const supervisors = users.filter(u => u.user_rank !== 'CSO' && u.user_rank !== 'CDT');
//   const displayedUsers = users.filter(u => filter === 'active' ? u.active : !u.active);

//   return (
//     <div className="AdminUsers">
//       <h2>User Management</h2>

//       <form className="user-form" onSubmit={onSubmit}>
//         <div className="form-title">{editing ? `Editing: ${editing.username}` : 'Add New User'}</div>
        
//         <div>
//           <label>Username</label>
//           <input name="username" value={form.username} onChange={onChange} required disabled={!!editing} />
//         </div>
        
//         {!editing && (
//           <div>
//             <label>Password</label>
//             <input name="password" type="password" value={form.password} onChange={onChange} required />
//           </div>
//         )}
        
//         <div>
//           <label>Full Name</label>
//           <input name="first_name" value={form.first_name} onChange={onChange} required />
//         </div>
        
//         <div>
//           <label>Email</label>
//           <input name="email" type="email" value={form.email} onChange={onChange} />
//         </div>
        
//         <div>
//           <label>Phone</label>
//           <input name="phone" value={form.phone} onChange={onChange} />
//         </div>
        
//         <div>
//           <label>Role</label>
//           <select name="user_rank" value={form.user_rank} onChange={onChange} required>
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
        
//         <div>
//           <label>Supervisor</label>
//           <select name="manager_id" value={form.manager_id || ''} onChange={onChange}>
//             <option value="">— None —</option>
//             {supervisors.map(u => (
//               <option key={u.id} value={u.id}>{u.first_name} ({u.username})</option>
//             ))}
//           </select>
//         </div>
        
//         <div className="checkbox-area">
//           <label htmlFor="active-checkbox">Active</label>
//           <input id="active-checkbox" name="active" type="checkbox" checked={form.active} onChange={onChange} />
//         </div>
        
//         <div className="buttons-area">
//           <button type="submit" className="btn-primary">{editing ? 'Update User' : 'Add User'}</button>
//           {editing && (
//             <button type="button" className="btn-secondary" onClick={cancelEdit}>Cancel</button>
//           )}
//         </div>
//       </form>

//       {/* --- NEW: Mobile-Only View Toggle Buttons --- */}
//       <div className="mobile-view-toggle">
//         <button 
//             className={`toggle-btn ${filter === 'active' ? 'active' : ''}`}
//             onClick={() => setFilter('active')}
//         >
//             Active Users
//         </button>
//         <button 
//             className={`toggle-btn ${filter === 'inactive' ? 'active' : ''}`}
//             onClick={() => setFilter('inactive')}
//         >
//             Inactive Users
//         </button>
//       </div>
//       {/* --- END NEW --- */}


//       {loading ? (
//         <p>Loading users…</p>
//       ) : (
//         <div className="table-wrapper">
//           <table className="users-table">
//             <thead>
//               <tr>
//                 <th>#</th>
//                 <th>Username</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Role</th>
//                 <th>Mgr ID</th>
//                 <th
//                   className="toggle-header"
//                   onClick={() => setFilter(f => (f === 'active' ? 'inactive' : 'active'))}
//                   title="Toggle Active/Inactive"
//                 >
//                   <span className="toggle-pill">
//                     {filter === 'active' ? <>Active <FaCheck/></> : <>Inactive <FaTimes/></>}
//                   </span>
//                 </th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {displayedUsers.map((u, i) => (
//                 <tr key={u.id}>
//                   <td data-label="#">{i + 1}</td>
//                   <td data-label="Username">{u.username}</td>
//                   <td data-label="Name">{u.first_name}</td>
//                   <td data-label="Email">{u.email}</td>
//                   <td data-label="Role">{u.user_rank}</td>
//                   <td data-label="Mgr ID">{u.manager_id || '—'}</td>
//                   <td data-label="Active">{u.active ? 'Yes' : 'No'}</td>
//                   <td data-label="Actions">
//                     <div className="action-buttons">
//                         <button className="btn-edit" onClick={() => startEdit(u)}>Edit</button>
//                         <button className="btn-delete" onClick={() => onDelete(u.id)}>Delete</button>
//                     </div>
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

import React, { useState, useEffect } from 'react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser
} from '../api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import './AdminUsers.css';

// TODO: Replace with the actual ID from your authentication context/store
// This is needed to prevent the user from deleting themselves on the frontend.
// The backend already protects against this, but disabling the button is good UX.
const LOGGED_IN_USER_ID = 1;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('active'); // 'active' | 'inactive'
  
  // --- NEW STATE FOR BETTER UX ---
  const [actionError, setActionError] = useState(''); // To display errors from the server
  const [deletingId, setDeletingId] = useState(null);   // To track which user is being deleted

  const [form, setForm] = useState({
    username: '', password: '', first_name: '',
    email: '', phone: '', user_rank: '', manager_id: '',
    active: true,
  });

  const load = async () => {
    setLoading(true);
    setActionError(''); // Clear previous errors on every load/reload
    try {
      const all = await getAdminUsers(true);
      setUsers(all);
    } catch (err) {
      setActionError('Failed to load users. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

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
    setActionError(''); // Clear previous errors before submitting
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
      // Use setActionError to display server validation errors instead of alert()
      setActionError(err.response?.data?.error || 'Save failed. Please check the form.');
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

  const onDelete = async (id) => {
    if (!window.confirm('Delete this user? This action cannot be undone.')) return;
    
    setDeletingId(id); // Set loading state for this specific user
    setActionError('');  // Clear previous errors

    try {
      await deleteAdminUser(id);
      load(); // Reload the list from the server to ensure UI is in sync
      window.dispatchEvent(new Event('hierarchyUpdated'));
    } catch (err) {
      // Display the specific error from the server (e.g., "Cannot delete your own account")
      setActionError(err.response?.data?.error || 'Failed to delete user.');
    } finally {
      setDeletingId(null); // Clear loading state regardless of outcome
    }
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

      {/* --- NEW: Error Display Area --- */}
      {actionError && <div className="user-action-error">{actionError}</div>}

      <div className="mobile-view-toggle">
        <button  
            className={`toggle-btn ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
        >
            Active Users
        </button>
        <button  
            className={`toggle-btn ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
        >
            Inactive Users
        </button>
      </div>

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
                      <button 
                        className="btn-delete" 
                        onClick={() => onDelete(u.id)}
                        disabled={deletingId === u.id || u.id === LOGGED_IN_USER_ID}
                      >
                        {deletingId === u.id ? 'Deleting...' : 'Delete'}
                      </button>
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
