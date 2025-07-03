import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const UserDetailsForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
  });

  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5005/api/user-details", {
        userId,
        ...formData,
      });

      if (response.status === 201) {
        navigate("/payment", { state: { userId } });
      }
    } catch (error) {
      console.error("Error submitting user details:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" name="name" onChange={handleChange} required />
      </label>
      <label>
        Address:
        <input type="text" name="address" onChange={handleChange} required />
      </label>
      <label>
        Phone:
        <input type="tel" name="phone" onChange={handleChange} required />
      </label>
      <button type="submit">Proceed to Payment</button>
    </form>
  );
};

export default UserDetailsForm;