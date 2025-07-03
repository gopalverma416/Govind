import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../utils/auth";
import { User, Mail, Calendar, MapPin, LogOut, Scale, Award, Edit } from "lucide-react";


const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) {
      alert("Please log in to access your account.");
      navigate("/login");
      return;
    }

    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/users/${userId}`)
      .then((response) => {
        console.log("User Data:", response.data);
        setUser(response.data.user);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching user details:", error);
        setLoading(false);
      });
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="animate-pulse flex flex-col items-center p-8 rounded-lg">
          <div className="h-20 w-20 bg-amber-200 rounded-full mb-4"></div>
          <div className="h-6 w-40 bg-amber-200 rounded mb-6"></div>
          <div className="space-y-3 w-full max-w-md">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-amber-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 py-12 px-4 sm:px-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-lg transform transition duration-300 hover:shadow-xl">
        <div className="w-full">
          <div className="bg-gradient-to-r from-yellow-500 to-amber-600 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award size={24} /> Gold Member
              </h2>
              <button
                onClick={() => navigate("/edit-profile")}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition"
              >
                <Edit size={18} className="text-white" />
              </button>
            </div>
            {user && (
              <div className="mt-6 text-center">
                <div className="inline-block h-24 w-24 rounded-full ring-4 ring-white bg-amber-100 flex items-center justify-center">
                  <User size={40} className="text-amber-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-white">{user.name}</h3>
              </div>
            )}
          </div>

          {user && (
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Email</p>
                    <p className="text-sm text-gray-800 font-medium">{user.email}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Age</p>
                    <p className="text-sm text-gray-800 font-medium">{user.age} years</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
                    <Scale size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Weight</p>
                    <p className="text-sm text-gray-800 font-medium">{user.weight} kg</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
                    <User size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Gender</p>
                    <p className="text-sm text-gray-800 font-medium">{user.gender}</p>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-3 border border-amber-200">
                  <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-2 rounded-full">
                    <MapPin size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-medium">Address</p>
                    <p className="text-sm text-gray-800 font-medium">{user.address}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-8 w-full py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold flex items-center justify-center gap-2 hover:from-amber-600 hover:to-yellow-700 transition shadow-md"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;