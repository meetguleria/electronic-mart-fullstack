import { useState, useEffect } from 'react';

import Layout from '../Layout/Layout';

import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function SignUp() {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('user');
  const [registered, setRegistered] = useState(false);
  const [showNotification, setShowNotification] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    if (showNotification) {
      const notificationTimeout = setTimeout(() => {
        setRegistered(true);
      }, 2000);

      return () => clearTimeout(notificationTimeout);
    }
  }, [showNotification]);

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/register`, {
        username,
        email,
        password,
        role_id: getRoleId(role),
      });

      setShowNotification(true);
      showSuccessNotification();
    } catch (error) {
      showErrorNotification();
      console.error('Error signing up:', error);
    }
  };

  const getRoleId = (roleName) => {
    switch (roleName) {
      case 'admin':
        return 1;
      case 'user':
        return 2;
      case 'mod':
        return 3;
      default:
        return null;
    }
  };

  const showSuccessNotification = () => {
    toast.success(`Congratulations! You have successfully registered.`,{
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      onClose: () => setRegistered(true),
    });
  };

  const showErrorNotification = () => {
    toast.error(`Error signing up. Please try again.`, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    });
  };

  if (registered) {
    return <Navigate replace to="/signin" />;
  }

  return (
      <Layout>
        <div className='signup-container'>
          <div className='signup-instructions'>
            <h2>Signup Instructions:</h2>
            <p>Fill out the form below to create an account:</p>
            <ul>
              <li>Choose a unique username.</li>
              <li>Provide a valid email address.</li>
              <li>Set a strong password.Atleast 8 characters, 1 uppercase, 1 lowercase, 1 special character</li>
              <li>Select your role from the dropdown.</li>
            </ul>
          </div>
          <div className='signup-form'>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUp}>
              <div>
                <label htmlFor="username">Username: </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email">Email: </label>
                <input 
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password">Password: </label>
                <input 
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div>
                  <label htmlFor='role'>Role: </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                    <option value="mod">Mod</option>
                  </select>
                </div>
              </div>
                <button type="submit">Sign Up</button>
            </form>
          </div>
        </div>
        <ToastContainer 
          autoClose={3000} 
          position='top-right' 
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </Layout>
  )
}

export default SignUp;