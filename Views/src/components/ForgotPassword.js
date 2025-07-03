import React, { useState } from 'react';
import { Mail, Key, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);


  // Base API URL
  const API_URL = "https://govind-jwellers.onrender.com/api/auth";

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter a valid email address");
      setStatus("error");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      setMessage(response.data.message || "OTP sent successfully to your email!");
      setStatus("success");
      setStep(2);
    } catch (error) {
      setMessage(error.response?.data?.msg || "Failed to send OTP. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setMessage("Please enter the OTP");
      setStatus("error");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/verify-otp`, { 
        email, 
        otp: otp.toString() 
      });
      
      // Make sure we're using the right property name for the token
      if (response.data.token) {
        setToken(response.data.token);
      } else {
        console.warn("Token not found in response:", response.data);
      }
      
      setMessage(response.data.message || "OTP verified successfully!");
      setStatus("success");
      setStep(3);
    } catch (error) {
      console.error("OTP verification error:", error);
      setMessage(error.response?.data?.msg || "Invalid OTP. Please try again.");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setMessage("Please enter a new password");
      setStatus("error");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      setStatus("error");
      return;
    }
    
    if (!token) {
      setMessage("Session expired. Please restart the password reset process.");
      setStatus("error");
      return;
    }
    
    setLoading(true);
    try {
      // Log the request payload for debugging (remove in production)
      console.log("Reset password request payload:", { token, newPassword });
      
      const response = await axios.post(`${API_URL}/reset-password`, { 
        token,
        newPassword 
      });
      
      setMessage(response.data.message || "Password reset successful!");
      setStatus("success");
      setStep(4);
    } catch (error) {
      console.error("Password reset error:", error);
      
      // More detailed error handling
      if (error.response) {
        console.log("Error response data:", error.response.data);
        setMessage(error.response.data.msg || "Failed to reset password. Please try again.");
      } else if (error.request) {
        setMessage("No response from server. Please check your connection.");
      } else {
        setMessage("Error: " + error.message);
      }
      
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md border border-amber-200">
        <h2 className="mb-6 text-2xl font-bold text-center text-amber-800">Reset Your Password</h2>
        
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 mb-2 
                ${step >= i ? 'bg-amber-500 border-amber-500 text-white' : 'border-amber-200 text-amber-200'}`}>
                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
              <span className={`text-xs ${step >= i ? 'text-amber-500' : 'text-amber-300'}`}>
                {i === 1 ? 'Email' : i === 2 ? 'OTP' : i === 3 ? 'New Password' : 'Done'}
              </span>
            </div>
          ))}
        </div>

        {/* Status message */}
        {message && (
          <div className={`p-4 mb-6 rounded-md ${status === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
            <div className="flex items-center">
              {status === 'error' ? <AlertCircle className="w-5 h-5 mr-2" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              <p>{message}</p>
            </div>
          </div>
        )}
        
        {/* Step 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-amber-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute w-5 h-5 text-amber-400 left-3 top-3" />
                <input
                  type="email"
                  className="w-full p-3 pl-10 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full p-3 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}
        
        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-amber-700">Verification Code</label>
              <div className="relative">
                <Key className="absolute w-5 h-5 text-amber-400 left-3 top-3" />
                <input
                  type="text"
                  className="w-full p-3 pl-10 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter OTP from your email"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-sm text-amber-600">We've sent a verification code to {email}</p>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                className="w-1/3 p-3 text-amber-600 bg-white border border-amber-500 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={`w-2/3 p-3 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-amber-700">New Password</label>
              <input
                type="password"
                className="w-full p-3 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-amber-600">Password must be at least 8 characters long</p>
            </div>
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-amber-700">Confirm Password</label>
              <input
                type="password"
                className="w-full p-3 border border-amber-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                className="w-1/3 p-3 text-amber-600 bg-white border border-amber-500 rounded-md hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                onClick={() => setStep(2)}
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                className={`w-2/3 p-3 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}
        
        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
            <h3 className="mb-2 text-xl font-semibold text-amber-800">Password Reset Successful!</h3>
            <p className="mb-6 text-amber-700">You can now log in with your new password.</p>
            <button
              className="w-full p-3 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              onClick={navigateToLogin}
            >
              Go to Login <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;