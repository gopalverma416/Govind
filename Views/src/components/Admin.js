import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  FaPlus, 
  FaImage, 
  FaList, 
  FaSketch, 
  FaTrash, 
  FaUpload, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaChartLine,
  FaUserShield,
  FaBox
} from "react-icons/fa";

const AdminDashboard = () => {
  const [file, setFile] = useState(null);
  const [sketchFile, setSketchFile] = useState(null);
  const [message, setMessage] = useState("");
  const [sketchMessage, setSketchMessage] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState("addItem");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [category, setCategory] = useState("");
  const [itemsfor, setItemsfor] = useState([]);
  const [analyticsData, setAnalyticsData] = useState({ totalOrders: 0, totalSales: 0 });
  const [selectedFile1, setSelectedFile1] = useState(null);
const [selectedFile2, setSelectedFile2] = useState(null);
const [previewImage1, setPreviewImage1] = useState(null);
const [previewImage2, setPreviewImage2] = useState(null);
const fileInputRef1 = useRef(null);
const fileInputRef2 = useRef(null);
 


  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check if user is an admin
    const token = localStorage.getItem("token");
    
    if (!token) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT
      setIsAdmin(decodedToken.role === "admin");
      setIsLoading(false);
    } catch (error) {
      console.error("Invalid token format");
      setIsAdmin(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) fetchItems();
  }, [isAdmin]);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5005/api/items");
      const data = await response.json();
      if (response.ok) setItems(data);
      else showNotification("Failed to fetch items.", "error");
    } catch (error) {
      showNotification("Error connecting to server.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token not found. Please log in.");
      const response = await fetch("http://localhost:5005/api/admin/payment", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!response.ok) throw new Error("Failed to fetch payment details");
  
      const data = await response.json();
      console.log("Fetched Data:", data); // Debug the API response
      setItemsfor(data);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
// Trigger fetch when Payments tab is active
useEffect(() => {
  if (activeCategory === "orders") {
    fetchPayments();
  }
}, [activeCategory]);  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  useEffect(() => {
    if (activeCategory === "analytics") {
      fetchAnalyticsData();
    }
  }, [activeCategory]);
  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get("http://localhost:5005/api/admin/orders-stats");
      setAnalyticsData(response.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const handleSketchFileChange = (e) => {
    setSketchFile(e.target.files[0]);
  };

  const showNotification = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // const handleUploadItem = async () => {
  //   if (!name || !price || !selectedFile) {
  //     showNotification("Please fill in all required fields.", "error");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("image", selectedFile);
  //   formData.append("name", name);
  //   formData.append("price", price);
  //   formData.append("category", category);
  //   if (description) formData.append("description", description);
  //   console.log("matter started");
  //   try {
  //     setIsLoading(true);
  //     const response = await axios.post("http://localhost:5005/api/items", formData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     showNotification("Jewelry item added successfully!");
  //     setItems([...items, response.data]);
  //     setName("");
  //     setPrice("");
  //     setDescription("");
  //     setCategory(""); 
  //     setSelectedFile(null);
  //     setPreviewImage(null);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   } catch (error) {
  //     showNotification("Error uploading item.", "error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleUploadItem = async () => {
    if (!name || !price ||!weight || !selectedFile1 || !selectedFile2) {
      showNotification("Please fill in all required fields and upload both images.", "error");
      return;
    }
  
    const formData = new FormData();
    formData.append("image1", selectedFile1);
    formData.append("image2", selectedFile2);
    formData.append("name", name);
    formData.append("price", price);
    formData.append("category", category);
    formData.append("weight", weight);
    if (description) formData.append("description", description);
  
    console.log("Uploading...");
  
    try {
      setIsLoading(true);
      const response = await axios.post("http://localhost:5005/api/multiple", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      showNotification("Jewelry item added successfully!");
      setItems([...items, response.data]);
      setName("");
      setPrice("");
      setDescription("");
      setCategory("");
      setWeight("");
      setSelectedFile1(null);
      setSelectedFile2(null);
      setPreviewImage1(null);
      setPreviewImage2(null);
  
      if (fileInputRef1.current) fileInputRef1.current.value = "";
      if (fileInputRef2.current) fileInputRef2.current.value = "";
    } catch (error) {
      showNotification("Error uploading item.", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const handleFileChange1 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile1(file);
      setPreviewImage1(URL.createObjectURL(file));
    }
  };
  
  const handleFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile2(file);
      setPreviewImage2(URL.createObjectURL(file));
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5005/api/items/remove/${itemId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        showNotification("Item removed successfully!");
        setItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
      } else {
        showNotification(data.error || "Failed to remove item.", "error");
      }
    } catch (error) {
      showNotification("Server error while removing item.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (type) => {
    const selectedFile = type === "sketch" ? sketchFile : file;
    const setMessageFn = type === "sketch" ? setSketchMessage : setMessage;

    if (!selectedFile) {
      setMessageFn("Please select a file.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const endpoint =
        type === "sketch"
          ? "http://localhost:5005/api/admin/upload-sketch"
          : "http://localhost:5005/api/admin/upload";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        showNotification(`${type === "sketch" ? "Sketch" : "Image"} uploaded successfully!`);
      } else {
        showNotification(data.error || "Upload failed", "error");
      }
    } catch (error) {
      showNotification("Error uploading image", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserShield className="text-red-500 text-2xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have administrator privileges to access this dashboard.</p>
          <a href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-200">
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <h2 className="text-xl font-bold">Admin Panel</h2>
          ) : (
            <span className="text-xl font-bold">AP</span>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="hover:bg-gray-800 p-2 rounded-full"
          >
            {sidebarOpen ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        <div className="mt-6">
          {[
            { key: "addItem", label: "Add Item", icon: <FaPlus /> },
            { key: "uploadSketch", label: "Upload Sketch", icon: <FaSketch /> },
            { key: "uploadImage", label: "Upload Image", icon: <FaImage /> },
            { key: "listItems", label: "View Items", icon: <FaList /> },
            { key: "analytics", label: "Analytics", icon: <FaChartLine /> },
            { key: "orders", label: "Order Recieved", icon: <FaBox /> },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveCategory(tab.key)}
              className={`w-full flex items-center py-3 px-4 my-1 transition-colors duration-200 ${
                activeCategory === tab.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {sidebarOpen && <span className="ml-4">{tab.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 py-2 px-4 rounded shadow-lg ${
            notification.type === 'error' ? 'bg-red-500' : 'bg-green-500'
          } text-white z-50 animate-fadeIn`}>
            {notification.text}
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-md p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeCategory === "addItem" && "Add New Jewelry"}
              {activeCategory === "uploadSketch" && "Upload Design Sketch"}
              {activeCategory === "uploadImage" && "Upload Gallery Image"}
              {activeCategory === "listItems" && "Inventory Management"}
              {activeCategory === "analytics" && "Sales Analytics"}
            </h1>
            <div className="flex space-x-4">
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <FaSearch className="text-gray-600" />
              </button>
              <div className="relative w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                A
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          {isLoading && (
            <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
              <div className="bg-white p-5 rounded-lg shadow-lg flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                <p>Processing...</p>
              </div>
            </div>
          )}

          {/* Add Item View */}
          {activeCategory === "addItem" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemName">
                      Item Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="itemName"
                      type="text" 
                      placeholder="e.g. Diamond Pendant Necklace" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                   {/* Category Selection */}
                    <div>
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemCategory">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="itemCategory"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="" disabled>Select a category</option>
                        <option value="necklaces">Necklaces</option>
                        <option value="rings">Rings</option>
                        <option value="bracelets">Bracelets</option>
                        <option value="earrings">Earrings</option>
                      </select>
                    </div>
                              
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemPrice">
                      Price (₹) <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="itemPrice"
                      type="number" 
                      placeholder="e.g. 5999" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemWeight">
                      weight: <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="itemWeight"
                      type="number" 
                      placeholder="e.g. 5.3gm" 
                      value={weight} 
                      onChange={(e) => setWeight(e.target.value)} 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="itemDescription">
                      Description
                    </label>
                    <textarea
                      id="itemDescription"
                      placeholder="Describe the jewelry item..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Item Image <span className="text-red-500">*</span>
                    </label>
                    <div 
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        ref={fileInputRef} 
                        className="hidden" 
                      />
                      <FaUpload className="mx-auto text-gray-400 text-3xl mb-3" />
                      <p className="text-gray-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                    </div>
                  </div> */}
                  <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Item Image 1 <span className="text-red-500">*</span>
                          </label>
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef1.current?.click()}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange1}
                              ref={fileInputRef1}
                              className="hidden"
                            />
                            <FaUpload className="mx-auto text-gray-400 text-3xl mb-3" />
                            <p className="text-gray-600">Click to upload Image 1 or drag and drop</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-gray-700 text-sm font-bold mb-2">
                            Item Image 2 <span className="text-red-500">*</span>
                          </label>
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => fileInputRef2.current?.click()}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange2}
                              ref={fileInputRef2}
                              className="hidden"
                            />
                            <FaUpload className="mx-auto text-gray-400 text-3xl mb-3" />
                            <p className="text-gray-600">Click to upload Image 2 or drag and drop</p>
                          </div>
                        </div>

                </div>
                
                <div className="lg:col-span-1">
                  <div className="bg-gray-50 p-4 rounded-lg h-full">
                    <h3 className="font-medium text-gray-700 mb-4">Preview</h3>
                    {/* {previewImage ? (
                      <div className="relative">
                        <img 
                          src={previewImage} 
                          alt="Preview" 
                          className="w-full h-64 object-cover rounded-lg shadow-md" 
                        />
                        <button 
                          onClick={() => {
                            setPreviewImage(null);
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }} 
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="border border-gray-200 rounded-lg h-64 flex items-center justify-center bg-white">
                        <p className="text-gray-400">No image selected</p>
                      </div>
                    )} */}<div>
  {previewImage1 && (
    <div className="relative">
      <img
        src={previewImage1}
        alt="Preview 1"
        className="w-full h-64 object-cover rounded-lg shadow-md"
      />
      <button
        onClick={() => {
          setPreviewImage1(null);
          setSelectedFile1(null);
          if (fileInputRef1.current) fileInputRef1.current.value = "";
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  )}

  {previewImage2 && (
    <div className="relative mt-4">
      <img
        src={previewImage2}
        alt="Preview 2"
        className="w-full h-64 object-cover rounded-lg shadow-md"
      />
      <button
        onClick={() => {
          setPreviewImage2(null);
          setSelectedFile2(null);
          if (fileInputRef2.current) fileInputRef2.current.value = "";
        }}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
      >
        <FaTrash className="w-4 h-4" />
      </button>
    </div>
  )}
</div>

                    
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-700">Item Summary</h4>
                      <div className="mt-2 text-sm text-gray-600">
                        <p><span className="font-medium">Name:</span> {name || '-'}</p>
                        <p><span className="font-medium">Price:</span> {price ? `₹${price}` : '-'}</p>
                        <p><span className="font-medium">Weight:</span> {weight ? `₹${weight}` : '-'}</p>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => {
                    setName("");
                    setPrice("");
                    setWeight("");
                    setDescription("");
                    setSelectedFile(null);
                    setPreviewImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }} 
                  className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors mr-4"
                >
                  Clear Form
                </button>
                <button 
                  onClick={handleUploadItem} 
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FaPlus className="mr-2" />
                  Add Jewelry Item
                </button>
              </div>
            </div>
          )}



          {/* Upload Sketch View */}
          {activeCategory === "uploadSketch" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <p className="text-gray-600 mb-6">Upload design sketches to be used by your craftsmen to create new jewelry pieces.</p>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => document.getElementById('sketchFileInput').click()}
                  >
                    <input 
                      id="sketchFileInput"
                      type="file" 
                      accept="image/*" 
                      onChange={handleSketchFileChange} 
                      className="hidden" 
                    />
                    <FaSketch className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-600">Upload a sketch design</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG up to 10MB</p>
                  </div>
                  {sketchFile && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FaImage className="text-blue-500 mr-3" />
                        <span className="text-gray-700">{sketchFile.name}</span>
                      </div>
                      <button 
                        onClick={() => setSketchFile(null)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleUpload("sketch")}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={!sketchFile}
                  >
                    <FaUpload className="mr-2" />
                    Upload Sketch
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Image View */}
          {activeCategory === "uploadImage" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <p className="text-gray-600 mb-6">Upload gallery images for your website showcase or marketing materials.</p>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={() => document.getElementById('galleryFileInput').click()}
                  >
                    <input 
                      id="galleryFileInput"
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setFile(e.target.files[0])} 
                      className="hidden" 
                    />
                    <FaImage className="mx-auto text-gray-400 text-4xl mb-3" />
                    <p className="text-gray-600">Upload a gallery image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                  </div>
                  {file && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                        <FaImage className="text-blue-500 mr-3" />
                        <span className="text-gray-700">{file.name}</span>
                      </div>
                      <button 
                        onClick={() => setFile(null)} 
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleUpload("image")}
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                    disabled={!file}
                  >
                    <FaUpload className="mr-2" />
                    Upload Image
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items List View */}
          {activeCategory === "listItems" && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FaSearch className="absolute left-3 top-3 text-gray-400" />
                </div>
                <div className="flex space-x-2">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center">
                    <FaList className="mr-2" />
                    List
                  </button>
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg flex items-center">
                    <FaImage className="mr-2" />
                    Grid
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="text-center py-12">
                  <FaList className="mx-auto text-gray-300 text-5xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No items found</h3>
                  <p className="text-gray-500">Start by adding your first jewelry item.</p>
                  <button 
                    onClick={() => setActiveCategory("addItem")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center"
                  >
                    <FaPlus className="mr-2" />
                    Add Jewelry Item
                  </button>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <FaSearch className="mx-auto text-gray-300 text-5xl mb-4" />
                  <h3 className="text-xl font-medium text-gray-600 mb-2">No matching items</h3>
                  <p className="text-gray-500">Try a different search term or browse all items.</p>
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center"
                  >
                    Show All Items
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item) => (
                      <div 
                        key={item._id} 
                        className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative h-48">
                          <img 
                            src={item.images[0]} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-opacity flex items-center justify-center opacity-0 hover:opacity-100">
                            <button 
                              onClick={() => handleRemoveItem(item._id)}
                              className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-lg text-gray-800 truncate">{item.name}</h4>
                          <p className="text-blue-600 font-bold mt-1">₹{item.price}</p>
                          <div className="flex justify-between items-center mt-3">
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">In Stock</span>
                            <button 
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setActiveCategory("addItem");
                                setName(item.name);
                                setPrice(item.price);
                                setPreviewImage(item.image);
                              }}
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 text-center text-gray-600">
                    Showing {filteredItems.length} of {items.length} items
                  </div>
                </>
              )}
            </div>
          )}

          {/* Analytics View - Placeholder */}
          {activeCategory === "analytics" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-12">
            <FaChartLine className="mx-auto text-gray-300 text-5xl mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Analytics Dashboard</h3>
            <p className="text-gray-500">Sales and inventory statistics will be displayed here.</p>

            <div className="mt-6">
              <h4 className="text-lg font-bold text-gray-700">Total Orders: {analyticsData.totalOrders}</h4>
              <h4 className="text-lg font-bold text-green-600">Total Sales: ₹{analyticsData.totalSales}</h4>
            </div>

            <p className="text-sm text-gray-400 mt-4">Updated in real-time</p>
          </div>
        </div>
      )}

       {activeCategory === "orders" && (
  <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
    <h2 className="text-2xl font-bold mb-6 pb-3 border-b border-gray-200 text-gray-800">
      Payment and Cart Details
    </h2>

    {isLoading ? (
      <div className="flex justify-center items-center space-x-4 py-8">
        <div className="animate-pulse w-10 h-10 bg-gray-300 rounded-full"></div>
        <p className="text-gray-600">Loading payment details...</p>
      </div>
    ) : (
      <>
        {itemsfor.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-lg">No payment details found.</p>
          </div>
        ) : (
          itemsfor.map((payment, index) => (
            <div 
              key={index} 
              className="mb-6 p-5 border border-gray-200 rounded-2xl hover:shadow-md transition-shadow duration-300 bg-white"
            >
              {payment.userDetails ? (
                <>
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <h3 className="text-xl font-semibold text-red-500 mb-2">
                      User: {payment.userDetails.firstName} {payment.userDetails.lastName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-blue-500 ">
                      <p>Phone: {payment.userDetails.phone}</p>
                      <p>
                        Address: {payment.userDetails.address?.street}, 
                        {payment.userDetails.address?.district},{" "}
                        {payment.userDetails.address?.pincode}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-700">
                      Payment Method: {payment.userDetails.paymentMethod}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      ₹{payment.userDetails.totalPrice}
                    </p>
                  </div>

                  <h4 className="mt-4 mb-3 text-lg font-semibold text-gray-800">
                    Cart Details:
                  </h4>
                  {!payment.userDetails?.cart || payment.userDetails.cart.length === 0 ? (
                    <p className="text-gray-500 bg-gray-50 p-3 rounded-lg text-center">
                      No items in cart
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {payment.userDetails.cart.map((item, i) => (
                        <li 
                          key={i} 
                          className="flex justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <span className="text-gray-700">Item ID: {item.itemId}</span>
                         
                          <span className="text-gray-600 font-semibold">
                            Quantity: {item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <p className="text-gray-600 text-center">User details not available.</p>
              )}
            </div>
          ))
        )}
      </>
    )}
  </div>
)}
          
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;