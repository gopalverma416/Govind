import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // Redirect if not authenticated
      return;
    }

    axios
      .get("http://localhost:5005/api/users", {
        headers: { Authorization: `Bearer ${token}` }, // Send token for auth
      })
      .then((response) => {
        setUsers(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users. Please try again.");
        setLoading(false);
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          Users List
        </h1>

        {loading && (
          <div className="flex justify-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
          </div>
        )}

        {error && <p className="text-red-500 text-center">{error}</p>}

        {!loading && !error && users.length === 0 && (
          <p className="text-gray-500 text-center">No users found.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {users.map((user) => (
              <div key={user._id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">{user.name}</h2>
                <p className="text-gray-600">Age: {user.age}</p>
                <p className="text-gray-600">Weight: {user.weight} kg</p>
                <p className="text-gray-400 text-sm">
                  Joined on: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
