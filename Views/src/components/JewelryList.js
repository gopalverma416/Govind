import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShoppingCartIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getUserIdFromToken } from "../utils/auth";
import Chat from "./Chat";
import Footbar from "./Footbar";
import React from 'react';
import LocalNav from "./site/LocalNav";
import WishlistButton from "./site/WishlistButton";
import PageMeta from "./site/PageMeta";
import { fetchCategories, formatPrice, titleCase } from "../lib/api";

// const categories = ["All", "Rings", "Necklaces", "Earrings", "Bracelets"];


const JewelryList = () => {
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const setSelectedCategory = (category) => setSearchParams(category === "All" ? {} : { category });

  const [hoveredItem, setHoveredItem] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const userId = getUserIdFromToken();

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(["All", ...data.filter(Boolean)])) // Add "All" as the default option
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);


  useEffect(() => {
    axios
      .get( selectedCategory === "All" ?   "https://govind-jwellers.onrender.com/api/items" : 
       `https://govind-jwellers.onrender.com/api/items/category/${selectedCategory}`)
      .then((response) => setItems(response.data))
      .catch((error) => console.error("Error fetching items:", error));

    if (userId) {
      axios
        .get(`https://govind-jwellers.onrender.com/api/cart/${userId}`)
        .then((response) => setCart(response.data.items || []))
        .catch((error) => console.error("Error fetching cart:", error));
    }
  }, [selectedCategory,userId]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    
    // Create preview URL
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };


  const handleItemClick = (itemId) => {
    navigate(`/product/${itemId}`); // Navigate to product details page
  };
  const handleUpload = async () => {
    if (!name || !price || !selectedFile) {
      alert("Add a name, a price and an image to continue.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("name", name);
    formData.append("price", price);

    try {
      const response = await axios.post("https://govind-jwellers.onrender.com/api/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setItems([...items, response.data]);
      setName("");
      setPrice("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowForm(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading item:", error);
    }
  };

  const addToCart = async (item) => {
    
    if (!userId) {
      alert("Sign in to add pieces to your bag.");
      return;
    }

    try {
      const response = await axios.post("https://govind-jwellers.onrender.com/api/cart/add", {
        userId,
        itemId: item._id,
        name: item.name,
        price: item.price,
        image: item.images[0],
      });

      setCart(response.data.cart.items || []);
      
      // Show temporary success indicator
      const itemElement = document.getElementById(`item-${item._id}`);
      if (itemElement) {
        itemElement.classList.add("border-green-500");
        setTimeout(() => {
          itemElement.classList.remove("border-green-500");
        }, 1000);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };
//  // Filtering logic: Show only selected category
//  const filteredItems = selectedCategory === "All"
//  ? items
//  : items.filter(item => item.category === selectedCategory);




  return (
    
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen pt-12">
      
      {/* Header */}
      {/* <header className="bg-white shadow-md py-4 px-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <span className="text-yellow-500 mr-2">✦</span> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-600 to-yellow-400">
              Elegant Jewels
            </span>
          </h1>
          
          <div className="flex items-center space-x-6">

            
            <button 
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-yellow-600 border border-yellow-500 hover:bg-yellow-50 font-medium py-2 px-4 rounded-lg flex items-center transition-all duration-300"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Jewelry
            </button>
            
            <div 
              className="relative cursor-pointer group" 
              onClick={() => navigate("/purchase")}
            > 
              <div className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-all duration-300 shadow-md">
                <ShoppingCartIcon className="w-6 h-6 text-white" />
              </div>
              
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                  {cart.length}
                </span>
              )}
              
              <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-lg py-2 px-4 text-gray-700 invisible group-hover:visible transition-all duration-200 opacity-0 group-hover:opacity-100">
                View Cart
              </div>
            </div>
          </div>
        </div>
      </header> */}
      <PageMeta
        title={selectedCategory === "All" ? "Shop Jewellery" : `Shop ${titleCase(selectedCategory)}`}
        description={`Shop handcrafted ${selectedCategory === "All" ? "jewellery" : selectedCategory} from Govind Jewellers.`}
      />
      <LocalNav
        title={selectedCategory === "All" ? "Jewellery" : titleCase(selectedCategory)}
        items={categories.map((category) => ({ key: category, label: category === "All" ? "All" : titleCase(category) }))}
        activeKey={selectedCategory}
        onSelect={setSelectedCategory}
        action={
          <button type="button" onClick={() => navigate("/purchase")} className="btn-filled px-[11px] py-[4px] text-[12px]">
            Bag{cart.length > 0 ? ` (${cart.length})` : ""}
          </button>
        }
      />

      <div className="max-w-7xl mx-auto p-8">
        {/* Add Item Form */}
        {showForm && (
          <div className="bg-white p-8 rounded-lg shadow-lg mb-8 transition-all duration-500 transform animate-fadeIn">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b border-gray-200 pb-2">Add a New Jewelry Item</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Item Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Diamond Necklace" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Price (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5999" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition" 
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">Item Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-500 transition-all duration-200">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      ref={fileInputRef} 
                      className="hidden" 
                      id="fileInput"
                    />
                    <label 
                      htmlFor="fileInput"
                      className="cursor-pointer text-gray-500 hover:text-gray-700"
                    >
                      <div className="p-4">
                        {!previewUrl && (
                          <>
                            <PlusIcon className="w-12 h-12 mx-auto text-gray-400" />
                            <p className="mt-2">Click to choose a file or drag it here</p>
                            <p className="text-sm text-gray-500">JPG, PNG or GIF</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                {previewUrl ? (
                  <div className="w-full h-64 relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-full h-full object-contain rounded-lg shadow-md" 
                    />
                    <button 
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }} 
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p>Preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-4">
              <button 
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setPrice("");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }} 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload} 
                className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                </svg>
                Add Jewelry Item
              </button>
            </div>
          </div>
        )}

        {/* Collection Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-800">{selectedCategory === "All" ? "Shop Jewellery." : `Shop ${titleCase(selectedCategory)}.`}</h2>
          <p className="text-gray-600 mt-2">Every piece is designed in our studio and finished by hand.</p>
          <div className="w-24 h-1 bg-yellow-500 mx-auto mt-4"></div>
        </div>

        {/* Items Grid */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {items.map((item) => (
            <div 
              key={item._id} 
              id={`item-${item._id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-transparent"
              onMouseEnter={() => setHoveredItem(item._id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative overflow-hidden h-64">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110" 
                />
                <div className="absolute top-4 right-4">
                  <button className="p-2 bg-white rounded-full shadow-md text-gray-700 hover:text-red-500 transition-colors">
                    <HeartIcon className="w-5 h-5" />
                  </button>
                </div>
                {hoveredItem === item._id && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={() => addToCart(item)} 
                      className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full font-medium shadow-lg transform transition hover:scale-105"
                    >
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-5">
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-500">
                    <StarIcon className="w-4 h-4" />
                    <StarIcon className="w-4 h-4" />
                    <StarIcon className="w-4 h-4" />
                    <StarIcon className="w-4 h-4" />
                    <StarIcon className="w-4 h-4 text-gray-300" />
                  </div>
                  <span className="text-xs text-gray-500 ml-2">(4.0)</span>
                </div>
                
                <h3 className="font-bold text-xl text-gray-800 mb-1">{item.name}</h3>
                
                <div className="flex justify-between items-center mt-3">
                  <p className="text-2xl font-bold text-yellow-600">₹{item.price}</p>
                  
                  <button
                    onClick={() => addToCart(item)}
                    className="p-2 bg-gray-100 hover:bg-yellow-100 rounded-full text-gray-700 hover:text-yellow-600 transition-colors"
                  >
                    <ShoppingCartIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div> */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {items.map((item) => (
        <div
          key={item._id}
          id={`item-${item._id}`}
          className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl border-2 border-transparent cursor-pointer"
          onMouseEnter={() => setHoveredItem(item._id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleItemClick(item._id)} // Navigate on click
        >
          <div className="relative overflow-hidden h-64">
            <img
              src={item.images[0]}
              alt={item.name}
              className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute top-4 right-4">
              <WishlistButton item={item} size={18} className="h-9 w-9" />
            </div>
            {hoveredItem === item._id && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when adding to cart
                    addToCart(item);
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-6 rounded-full font-medium shadow-lg transform transition hover:scale-105"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>

          <div className="p-5">
            {item.category && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">{titleCase(item.category)}</p>}

            <h3 className="font-bold text-xl text-gray-800 mb-1">{item.name}</h3>

            <div className="flex justify-between items-center mt-3">
              <p className="text-2xl font-bold text-yellow-600">{formatPrice(item.price)}</p>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent redirection when adding to cart
                  addToCart(item);
                }}
                className="p-2 bg-gray-100 hover:bg-yellow-100 rounded-full text-gray-700 hover:text-yellow-600 transition-colors"
              >
                <ShoppingCartIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
        
        {/* Empty State */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700">New designs are on their way.</h3>
            <p className="text-gray-500 mt-2">Nothing here just yet. Explore the rest of the collection in the meantime.</p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-6 rounded-lg inline-flex items-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Jewelry Item
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
<div className="mt-20 pt-10">
<Footbar />

</div> 
    </div>
  );
};

export default JewelryList;