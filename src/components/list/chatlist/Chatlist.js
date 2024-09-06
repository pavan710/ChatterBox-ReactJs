import React, { useEffect, useState } from 'react';
import './chatlist.css';
import Adduser from './addUser/Adduser';
import { useUserStore } from '../../../lib/userStore';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';

function Chatlist() {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const unsub = onSnapshot(doc(db, 'userchats', currentUser.id), async (res) => {
      const items = res.data().chats;
      const promises = items.map(async (item) => {
        const userDocRef = doc(db, 'users', item.receiverId);
        const userDocSnap = await getDoc(userDocRef);
        const user = userDocSnap.data();
        return { ...item, user };
      });
      const chatData = await Promise.all(promises);
      setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
    });

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex((item) => item.chatId === chat.chatId);
    userChats[chatIndex].isSeen = true;
    const userChatsRef = doc(db, 'userchats', currentUser.id);
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
    } catch (err) {
      console.error(err);
    }
    changeChat(chat.chatId, chat.user);
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className='chatlist'>
      <div className='search'>
        <div className='searchbar'>
          <img src='/search.png' alt='Search Icon' />
          <input
            type='text'
            placeholder='search'
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src='plus.png'
          className='add'
          alt='Add Icon'
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          className='items'
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{ backgroundColor: chat?.isSeen ? 'transparent' : '#5183fe' }}
        >
          <img
            src={chat.user.blocked.includes(currentUser.id) ? './blocked-avatar.png' : (chat.user.avatar || './avatar.png')}
            alt='User Avatar'
          />
          <div className='texts'>
            <span>{chat.user.blocked.includes(currentUser.id) ? 'user' : chat.user.username}</span>
            <p>{chat.lastMessage || 'No message yet'}</p>
          </div>
        </div>
      ))}
      {addMode && <Adduser />}
    </div>
  );
}

export default Chatlist;
