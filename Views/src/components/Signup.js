import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { User, Mail, Lock, Calendar, Weight, MapPin, Loader } from "lucide-react";
import Signup1 from "./Sign1";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    weight: "",
    gender: "",
    address: "",
  });

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
      const res = await axios.post("${process.env.REACT_APP_API_BASE}/api/auth/signup", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/users"); // Redirect to users page after signup
    } catch (err) {
      setError(err.response?.data?.msg || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 pt-20 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 flex items-center justify-center shadow-lg">
            <User className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-amber-900">Create Your Account</h2>
          <p className="mt-2 text-sm text-amber-700">
            Join our community of gold jewelry enthusiasts
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-lg border border-amber-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-amber-800">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                  placeholder="John Doe"
                  onChange={handleChange}
                  value={formData.name}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-amber-800">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                  placeholder="email@example.com"
                  onChange={handleChange}
                  value={formData.email}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-amber-800">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-amber-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                  placeholder="••••••••"
                  onChange={handleChange}
                  value={formData.password}
                />
              </div>
            </div>

            {/* Two columns for age and weight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-amber-800">
                  Age
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    required
                    className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                    placeholder="25"
                    onChange={handleChange}
                    value={formData.age}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-amber-800">
                  Weight (kg)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Weight className="h-5 w-5 text-amber-500" />
                  </div>
                  <input
                    id="weight"
                    name="weight"
                    type="number"
                    className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                    placeholder="65"
                    onChange={handleChange}
                    value={formData.weight}
                  />
                </div>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-amber-800">
                Gender
              </label>
              <select
                id="gender"
                name="gender"
                required
                className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900"
                onChange={handleChange}
                value={formData.gender}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-amber-800">
                Delivery Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-amber-500" />
                </div>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="3"
                  className="pl-10 focus:ring-amber-500 focus:border-amber-500 block w-full border-amber-300 rounded-lg py-3 text-amber-900 placeholder-amber-400"
                  placeholder="123 Main St, City, Country"
                  onChange={handleChange}
                  value={formData.address}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-amber-900 font-medium bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader className="h-5 w-5 mr-2 animate-spin" />
                  Creating Account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          <div className="flex items-center justify-center mt-6">
            <div className="text-sm">
              <a href="/login" className="font-medium text-amber-600 hover:text-amber-800">
                Already have an account? Sign in
              </a>
            </div>
          </div>
        </form>
         <div>
         <Signup1/>
         </div>
        {/* Footer */}
        <div className="text-center text-xs text-amber-700">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default Signup;