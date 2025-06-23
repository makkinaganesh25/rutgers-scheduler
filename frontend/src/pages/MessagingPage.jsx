import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import ChatList from '../components/messaging/ChatList';
import ChatWindow from '../components/messaging/ChatWindow';
import UserSearchAndCreateChat from '../components/messaging/UserSearchAndCreateChat';
import { firestore } from '../firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import './MessagingPage.css';
import { FaPlus } from 'react-icons/fa';

export default function MessagingPage() {
  const { user: appUser, fbUser } = useContext(AuthContext);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allAppUsers, setAllAppUsers] = useState([]);

  // 1) Load allAppUsers from your backend
  useEffect(() => {
    (async () => {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const arr = await res.json();
      setAllAppUsers(arr.filter(u => String(u.id) !== String(appUser.id))
        .map(u => ({ id: String(u.id), displayName: u.first_name || u.username, userRank: u.user_rank }))
      );
    })();
  }, [appUser]);

  // 2) Subscribe to chats in Firestore
  useEffect(() => {
    if (!fbUser) return;
    const q = query(
      collection(firestore, 'chats'),
      where('members', 'array-contains', fbUser.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, snap => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChats(data);
    });
  }, [fbUser]);

  // 3) Handlers for creating/selecting chats
  const startIndividualChat = async (target) => {
    const members = [fbUser.uid, target.id].sort();
    const chatId = members.join('_');
    const ref = doc(firestore, 'chats', chatId);
    const existing = await getDoc(ref);
    if (existing.exists()) {
      setActiveChat({ id: chatId, ...existing.data() });
    } else {
      const base = {
        type: 'individual',
        members,
        memberInfo: {
          [fbUser.uid]: { displayName: appUser.first_name, userRank: appUser.user_rank },
          [target.id]: { displayName: target.displayName, userRank: target.userRank }
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastMessage: null
      };
      await setDoc(ref, base);
      setActiveChat({ id: chatId, ...base });
    }
    setSearchOpen(false);
  };

  const startGroupChat = async (name, membersList) => {
    const members = [...new Set([fbUser.uid, ...membersList.map(u=>u.id)])];
    const info = {};
    members.forEach(id => {
      const u = id === fbUser.uid
        ? { displayName: appUser.first_name, userRank: appUser.user_rank }
        : membersList.find(x=>x.id===id);
      info[id] = { displayName: u.displayName, userRank: u.userRank };
    });
    const docRef = await addDoc(collection(firestore, 'chats'), {
      type: 'group',
      groupName: name,
      members,
      memberInfo: info,
      createdBy: fbUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessage: null
    });
    setActiveChat({ id: docRef.id, type:'group', groupName: name, members, memberInfo: info });
    setSearchOpen(false);
  };

  if (!appUser || !fbUser) return <p>Loading messaging…</p>;

  return (
    <div className="messaging-container">
      <aside className="messaging-sidebar">
        <header>
          <h3>Chats</h3>
          <button onClick={()=>setSearchOpen(true)}><FaPlus /></button>
        </header>
        <ChatList
          chats={chats}
          currentUserFirebaseId={fbUser.uid}
          onSelect={c=>setActiveChat(c)}
          activeId={activeChat?.id}
        />
      </aside>
      <main className="messaging-main">
        {activeChat
          ? <ChatWindow chat={activeChat} />
          : <div className="no-chat-selected">Select or start a chat</div>
        }
      </main>
      {searchOpen && (
        <UserSearchAndCreateChat
          allAppUsers={allAppUsers}
          currentUserId={fbUser.uid}
          onCreateIndividual={startIndividualChat}
          onCreateGroup={startGroupChat}
          onClose={()=>setSearchOpen(false)}
        />
      )}
    </div>
  );
}