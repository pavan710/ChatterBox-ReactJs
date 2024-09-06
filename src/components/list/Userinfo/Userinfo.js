import React from 'react'
import './userinfo.css'
import Chatlist from '../chatlist/Chatlist.js'
import { useUserStore } from '../../../lib/userStore.js'
function Userinfo() {
  const {currentUser}=useUserStore();
  return (
    <>
    <div className='userinfo'>
     <div className='user'>
        <img src={currentUser.avatar || './avatar.png'}/>
        <h2>{currentUser.username}</h2>
     </div>
     <div className='icons'>
        <img src='./more.png'/>
        <img src='./video.png'/>
        <img src='./edit.png'/>
     </div>
    
        
    </div>
    <Chatlist/>
    </>
  )
}

export default Userinfo