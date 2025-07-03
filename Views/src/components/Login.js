import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Loader, User } from "lucide-react";
import Login1 from "./Login1";



const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post("${process.env.REACT_APP_API_BASE}/api/auth/login", formData);
      console.log("API response:", res); // Log the response to inspect the data
      
      if (res.data.token) {
        // Save token to localStorage
        localStorage.setItem("token", res.data.token);
        console.log("Token saved to localStorage:", localStorage.getItem("token"));
        
        navigate("/users"); // Redirect to the users page after successful login
      } else {
        // If no token, show an error message
        console.error("Token not found in response data");
        setError("Login failed. Token not returned.");
      }
        
    } catch (err) {
      setError(err.response?.data?.msg || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-yellow-50 flex items-center justify-center p-6 pt-20">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg mb-6">
            <User className="h-10 w-10 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold text-amber-900">Welcome Back</h2>
         
          <p className="mt-2 text-amber-700">Sign in to access your jewelry collection</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-amber-200">
          {/* Gold accent top bar */}
          <div className="h-3 bg-gradient-to-r from-amber-400 to-yellow-500"></div>
          
          <form onSubmit={handleSubmit} className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-amber-800 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 block w-full rounded-lg border-amber-300 shadow-sm focus:ring-amber-500 focus:border-amber-500 py-3 bg-amber-50"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-amber-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 block w-full rounded-lg border-amber-300 shadow-sm focus:ring-amber-500 focus:border-amber-500 py-3 bg-amber-50"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Remember me / Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-amber-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-amber-700">
                    Remember me
                  </label>
                </div>


                <div className="text-sm">
               <button
                onClick={() => navigate("/forget")}
                className="font-medium text-amber-600 hover:text-amber-800"
                >
                 Forgot your password?
               </button>
                </div>
                </div> 

              {/* Submit button */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-amber-900 font-medium bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </div>

            {/* Create account link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-amber-700">
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="font-medium text-amber-600 hover:text-amber-800 underline"
                >
                  Create one now
                </a>
              </p>
            </div>
          </form>
        </div>
        <div className="relative my-6">
  <div className="absolute inset-0 flex items-center" aria-hidden="true">
    <div className="w-full border-t-2 border-amber-200 opacity-50"></div>
  </div>
  <div className="relative flex justify-center">
    <span className="bg-white px-4 text-sm font-medium text-amber-700 
      border border-amber-200 rounded-full 
      shadow-sm transform transition duration-300 
      hover:bg-amber-50 hover:text-amber-900">
      or
    </span>
  </div>
</div>
<div>
  <Login1/>
</div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-amber-700 flex items-center justify-center">
            <Lock className="h-3 w-3 mr-1" />
            Secure, encrypted connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;