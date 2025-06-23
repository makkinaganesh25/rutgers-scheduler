import React from 'react';
export default function ChatList({ chats, currentUserFirebaseId, onSelect, activeId }) {
  if (!chats.length) return <p>No chats yet.</p>;
  return (
    <ul>
      {chats.map(c => {
        const isActive = c.id===activeId;
        const info = c.type==='group'
          ? { name:c.groupName }
          : c.memberInfo[ Object.keys(c.memberInfo).find(id=>id!==currentUserFirebaseId) ];
        return (
          <li
            key={c.id}
            className={isActive?'active':''}
            onClick={()=>onSelect(c)}
          >
            <div>{info.name}</div>
            {c.lastMessage&&<small>{c.lastMessage.text}</small>}
          </li>
        );
      })}
    </ul>
  );
}