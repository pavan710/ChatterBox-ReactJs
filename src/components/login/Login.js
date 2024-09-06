import React, { useState } from 'react';
import './login.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Notification from '../notification/Notification';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db, storage } from '../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';

function Login() {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });

    const [loading,setloading]=useState(false);

    const handleAvatar = e => {
        if (e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            });
        }
    };

    const handleLogin = async e => {
        e.preventDefault();
        setloading(true);
        const formdata = new FormData(e.target);
        const { email, password } = Object.fromEntries(formdata);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Logged in successfully");
        } catch (error) {
            toast.error("Please check your login details.");
        }
    };
    
    const handleRegister = async e => {
        e.preventDefault();
        setloading(true);
        const formdata = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formdata);
        
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await upload(avatar.file);
            await setDoc(doc(db, 'users', res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid, 
                blocked: [],
            });

            await setDoc(doc(db, 'userchats', res.user.uid), {
                chats: [],
            });

            toast.success("Account created successfully");
        } catch (error) {
            toast.warn(error.message);
        }
        finally{
            setloading(false);
        }
    };

    return (
        <div className='login'>
            <div className='item'>
                <h3>Welcome back</h3>
                <form onSubmit={handleLogin}>
                    <input type='text' placeholder='Email' name='email' />
                    <input type='password' placeholder='Password' name='password' />
                    <button disabled={loading}>{loading?"Loading":"Login"}</button>
                </form>
            </div>
           
            <div className='item'>
                <h3>Create an account</h3>
                <form onSubmit={handleRegister}>
                    <div className='image'>
                        <label htmlFor='file'>
                            <h4>Upload an image</h4>
                        </label>
                        <img src={avatar.url || './avatar.png'} alt='Avatar' className='profile' />
                    </div>
                    <input type='file' id='file' style={{ display: "none" }} onChange={handleAvatar} />
                    <input type='text' placeholder='Username' name='username' />
                    <input type='text' placeholder='Email' name='email' />
                    <input type='password' placeholder='Password' name='password' />
                    <button disabled={loading}>{loading?"Loading":"Signup"}</button>
                </form>
            </div>
            <Notification position='bottom-right' />
        </div>
    );
}

export default Login;
