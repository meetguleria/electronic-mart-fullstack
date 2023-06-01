import { useState } from 'react';

import Layout from '../Layout/Layout';

import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';


function SignIn() {

  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const API_BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/signin`, {
        username,
        password,
      });

      const token = response.data.token;

      localStorage.setItem('token', token);
      console.log(token)
      showSuccessNotification();
    } catch (error) {
      showErrorNotification();
      console.error('Error signing in:', error);
    }
  }

  const showSuccessNotification = () => {
    toast.success('Sign in successful!', {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
      onClose: () => navigate('/dashboard'),
    });
  };

  const showErrorNotification = () => {
    toast.error('Error signing in. Please try again.', {
      position: toast.POSITION.TOP_CENTER,
      autoClose: 3000,
    });
  };

  return (
    <Layout>
      <div className='signin-container'>
        <div className='signin-form'>
          <h2>SignIn</h2>
          <form onSubmit={handleSignIn}>
            <div className='form-group'>
              <label htmlFor='username'>Username: </label>
              <input 
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className='form-group'>
              <label htmlFor='password'>Password: </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div> 
            <button type="submit">Sign In</button>
          </form>
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
      </div>
    </Layout>
  )
}

export default SignIn;