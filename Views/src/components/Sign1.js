import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const clientId = "855438909825-qc3vgibmpsijaa39vmsm0ag2gk700u2n.apps.googleusercontent.com";

const SignupWithGoogle = () => {
  const [userData, setUserData] = useState({
    age: '',
    gender: 'Male',
    address: '',
    weight: '',
  });

  const handleSuccess = async (response) => {
    console.log("Google Login Successful:", response);
    const token = response.credential;

    try {
      const res = await fetch('http://localhost:5005/api/auth/google-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...userData }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Signup verified:', data);
        localStorage.setItem('token', data.token);
        alert('Signup successful!');
      } else {
        console.error('Signup failed:', data.msg);
        alert(data.msg || 'Signup failed. Please try again.'); 
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  const handleError = () => {
    console.log("Google Login Failed");
    alert('Google Login failed. Please try again.');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <input name="age" placeholder="Age" onChange={handleChange} className="w-full p-2 border" />
        <select name="gender" onChange={handleChange} className="w-full p-2 border">
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <input name="address" placeholder="Address" onChange={handleChange} className="w-full p-2 border" />
        <input name="weight" placeholder="Weight" onChange={handleChange} className="w-full p-2 border" />
        <div className="flex justify-center">
          <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignupWithGoogle;
