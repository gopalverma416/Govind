import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';


const clientId = "855438909825-qc3vgibmpsijaa39vmsm0ag2gk700u2n.apps.googleusercontent.com";

const Login1 = () => {
  const handleSuccess = async (response) => {
    console.log("Login Successful:", response);
    const token = response.credential;

    try {
      const res = await fetch('http://localhost:5005/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Login verified:', data);
        localStorage.setItem('token', data.token);
        alert('Login successful!');
      } else {
        console.error('Login failed:', data.msg);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center">
          <GoogleLogin 
            onSuccess={handleSuccess} 
            onError={handleError}
            theme="filled_blue"
            size="large"
            text="signin_with"
            shape="rectangular"
            width="350"
          />
        </div>
        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Secure login powered by Google</p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login1;
