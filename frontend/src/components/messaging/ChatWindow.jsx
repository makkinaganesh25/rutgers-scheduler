import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import { firestore } from '../../firebaseConfig';
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, updateDoc, doc
} from 'firebase/firestore';
import MessageInput from './MessageInput';

export default function ChatWindow({ chat }) {
  const { fbUser, user: appUser } = useContext(AuthContext);
  const [msgs, setMsgs] = useState([]);
  const bottomRef = useRef();

  useEffect(() => {
    const q = query(
      collection(firestore, 'chats', chat.id, 'messages'),
      orderBy('timestamp','asc')
    );
    return onSnapshot(q, snap => {
      setMsgs(snap.docs.map(d=>({ id:d.id, ...d.data() })));
      bottomRef.current?.scrollIntoView({ behavior:'smooth' });
    });
  }, [chat.id]);

  const handleSend = async (text) => {
    const msg = {
      senderId: fbUser.uid,
      senderDisplayName: appUser.first_name,
      text,
      timestamp: serverTimestamp(),
      type: 'text'
    };
    await addDoc(
      collection(firestore, 'chats', chat.id, 'messages'),
      msg
    );
    // update lastMessage & updatedAt
    const chatRef = doc(firestore,'chats',chat.id);
    await updateDoc(chatRef, {
      lastMessage: { ...msg, timestamp: serverTimestamp() },
      updatedAt: serverTimestamp()
    });
  };

  return (
    <div className="chat-window">
      <div className="messages">
        {msgs.map(m => (
          <div
            key={m.id}
            className={m.senderId===fbUser.uid?'msg-sent':'msg-recv'}
          >
            <p>{m.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}