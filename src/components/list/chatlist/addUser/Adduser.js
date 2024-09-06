import React, { useState } from 'react';
import './adduser.css';
import { db } from '../../../../lib/firebase';
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { useUserStore } from '../../../../lib/userStore';

function Adduser() {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [showAddUser, setShowAddUser] = useState(true); // State to control visibility

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userRef = collection(db, 'users');
      const q = query(userRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data());
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError('Error searching user');
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!user) return;
    try {
      const newChatRef = doc(collection(db, 'chats'));
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const userChatData = {
        chatId: newChatRef.id,
        lastMessage: '',
        receiverId: user.id,
        updatedAt: Date.now(),
      };

      await updateDoc(doc(db, 'userchats', currentUser.id), {
        chats: arrayUnion(userChatData),
      });

      await updateDoc(doc(db, 'userchats', user.id), {
        chats: arrayUnion({
          ...userChatData,
          receiverId: currentUser.id,
        }),
      });

      setUser(null);
      setUsername('');
      setShowAddUser(false); // Hide the component after adding
    } catch (err) {
      setError('Error adding user to chat');
      console.error(err);
    }
  };

  const handleCancel = () => {
    setUser(null);
    setUsername('');
    setError('');
    setShowAddUser(false); // Hide the component
  };

  if (!showAddUser) return null; // Don't render anything if `showAddUser` is false

  return (
    <div className='adduser'>
      <form className='form' onSubmit={handleSearch}>
        <input
          type='text'
          placeholder='Username'
          name='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button type='submit'>Search</button>
        <button type='button' onClick={handleCancel} className='cancel'>X</button>
      </form>
      {error && <p className='error'>{error}</p>}
      {user && (
        <div className='user' id="dis">
          <div className='details'>
            <img src={user.avatar || '/avatar.png'} alt='Avatar' />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd} className='add'>Add User</button>
        </div>
      )}
    </div>
  );
}

export default Adduser;
