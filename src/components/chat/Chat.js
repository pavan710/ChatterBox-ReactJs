import React, { useState, useRef, useEffect } from 'react';
import './chat.css';
import EmojiPicker from 'emoji-picker-react';
import { doc, getDoc, onSnapshot, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useChatStore } from '../../lib/chatStore';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import { auth } from '../../lib/firebase';

function Chat() {
  const [chat, setChat] = useState(null);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(
      doc(db, "chats", chatId),
      (res) => {
        setChat(res.data());
      }
    );

    return () => {
      unSub();
    };
  }, [chatId]);

  function handleEmoji(e) {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  }

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      });
    }
  };

  const handleSend = async () => {
    if (text === "" && !img.file) return;

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const newMessage = {
        senderId: currentUser.id,
        text,
        createdAt: Date.now(),
        ...(imgUrl && { img: imgUrl }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(newMessage),
      });

      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userChats", id);
        const userChatSnapshot = await getDoc(userChatsRef);

        if (userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();

          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          if (chatIndex > -1) {
            userChatsData.chats[chatIndex].lastMessage = text || "Image";
            userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
    console.log(text);
    setText("");
    setImg({
      file: null,
      url: ""
    });
  };

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + strMinutes + ' ' + ampm;
  }
  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  return (
    <div className='chat'>
      <div className='top'>
        <div className='user'>
          <img src={user?.avatar || "./avatar.png"} alt='User Avatar' />
          <div className='texts'>
            <span>{user?.username}</span>
            <p>Live in the moment.</p>
          </div>
        </div>

        <div className='icons'>
         
          <button className='send' onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className='center'>
        {chat?.messages?.map((message, index) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={index}>
            <div className='texts'>
              {message.img && <img src={message.img} alt='Message' />}
              <p>{message.text}</p>
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </div>
        ))}
        {img.url && (
          <div className='message own'>
            <div className='texts'>
              <img src={img.url} alt='Preview' />
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className='bottom'>
        <div className='icons'>
          <label htmlFor='file'>
            <img src='/img.png' alt='Image Icon' />
          </label>
          <input id='file' type='file' style={{ display: "none" }} onChange={handleImg} />
          <img src='/camera.png' alt='Camera Icon' />
          <img src='/mic.png' alt='Mic Icon' />
        </div>
        <input placeholder={isCurrentUserBlocked || isReceiverBlocked ? 'You cannot send a message' : 'Type a message...'} onChange={(e) => setText(e.target.value)} value={text} />
        <div className='emoji'>
          <img src='/emoji.png' alt='Emoji Icon' onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className='picker'>
              <EmojiPicker onEmojiClick={handleEmoji} />
            </div>
          )}
        </div>
        <button className='send' onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
