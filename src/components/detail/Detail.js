import React, { useState, useEffect } from 'react';
import './detail.css';
import { auth, db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import { useChatStore } from '../../lib/chatStore';
import { arrayRemove, arrayUnion, doc, updateDoc } from 'firebase/firestore';



function Detail() {
  const {currentUser}=useUserStore();
  const {chatId,isCurrentUserBlocked,isReceiverBlocked, changeBlock}=useChatStore();
  const handleBlock=async()=>{
    if(!user)return;
    const userDockRef = doc(db, "users", currentUser. id);
    try {
      await updateDoc (userDockRef,{
      blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
    });
    changeBlock();
    }
      catch (err) {
  console. log(err);
  };
  }




  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        console.log('User is authenticated:', user);
        setUser(user);
      } else {
        console.log('No user is authenticated');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please log in to see the details.</div>;
  }

  return (
    <div className='detail'>
      <div className='user'>
        <img src={user.photoURL || '/avatar.png'} alt='Avatar' />
        <h2>{user.displayName || 'Jane'}</h2>
        <p>Hello</p>
      </div>
      <div className='info'>
        <div className='option'>
          <div className='title'>
            <span>Chat Settings</span>
            <img src='/arrowUp.png' alt='Arrow Up' />
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Privacy & Help</span>
            <img src='/arrowUp.png' alt='Arrow Up' />
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Shared Photos</span>
            <img src='/arrowDown.png' alt='Arrow Down' />
          </div>
          <div className='photos'>
            <div className='photoItem'>
              <div className='photodetail'>
                <img src='/photo.png' alt='Photo' />
                <span>photo.png</span>
              </div>
            </div>
          </div>
        </div>
        <div className='option'>
          <div className='title'>
            <span>Shared Files</span>
            <img src='/arrowUp.png' alt='Arrow Up' />
          </div>
        </div>
        <button className='block' onClick={handleBlock}>
          {isCurrentUserBlocked
          ?"You are Blocked!"
          :isReceiverBlocked
          ?"User blocked"
          :"Block User"}
        </button>
        <button className='logout' onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
}

export default Detail;
