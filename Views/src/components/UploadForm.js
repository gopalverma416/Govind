import React, { useState } from "react";
import axios from "axios";

const UploadForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    image1: null,
    image2: null,
  });

  const [previews, setPreviews] = useState({
    image1: null,
    image2: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image1" || name === "image2") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, [name]: file }));
      
      // Create image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({ ...prev, [name]: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("name", formData.name);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("image1", formData.image1);
    data.append("image2", formData.image2);

    try {
      const response = await axios.post("https://govind-jwellers.onrender.com/api/multiple", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("Upload Successful:", response.data);
      alert("Item added successfully!");
      
      // Reset form and previews
      setFormData({
        name: "",
        price: "",
        category: "",
        image1: null,
        image2: null,
      });
      setPreviews({
        image1: null,
        image2: null,
      });
    } catch (error) {
      console.error("Upload Error:", error.response?.data?.message || error.message);
      alert("Failed to add item!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white shadow-md rounded-lg p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Upload New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="image1" className="block text-sm font-medium text-gray-700 mb-2">
                Image 1
              </label>
              <input
                type="file"
                id="image1"
                name="image1"
                accept="image/*"
                onChange={handleChange}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {previews.image1 && (
                <img 
                  src={previews.image1} 
                  alt="Preview 1" 
                  className="mt-2 w-full h-32 object-cover rounded-md"
                />
              )}
            </div>

            <div>
              <label htmlFor="image2" className="block text-sm font-medium text-gray-700 mb-2">
                Image 2
              </label>
              <input
                type="file"
                id="image2"
                name="image2"
                accept="image/*"
                onChange={handleChange}
                required
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {previews.image2 && (
                <img 
                  src={previews.image2} 
                  alt="Preview 2" 
                  className="mt-2 w-full h-32 object-cover rounded-md"
                />
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Upload Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadForm;