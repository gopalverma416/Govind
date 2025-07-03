import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import axios from "axios";
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  TruckIcon, 
  ShieldCheckIcon, 
  GiftIcon,
  SparklesIcon,
  ShareIcon,
  ScaleIcon 
  , XIcon 
} from "@heroicons/react/24/outline";

import { StarIcon } from "@heroicons/react/24/solid";
import { getUserIdFromToken } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const ProductDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const userId = getUserIdFromToken();

  const navigate = useNavigate();
  const product = {
    name: "Splendid Filigree Work Gold Bangle",
    imageUrl: "https://your-image-url.com/image.jpg",
    productUrl: window.location.href
  };

  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(product.productUrl);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      alert('Failed to copy the link. Please try again.');
    }
  };

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_BASE}/api/items/${id}`)
      .then((response) => setItem(response.data))
      .catch((error) => console.error("Error fetching product details:", error));
  }, [id]);

  if (!item) return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <div className="animate-pulse w-24 h-24 bg-gray-400 rounded-full shadow-lg"></div>
    </div>
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon 
        key={index} 
        className={`h-6 w-6 ${index < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const addToCart = async (item) => {
    if (!userId) {
      alert("User is not logged in!");
      return;
    }

    try {
      await axios.post("${process.env.REACT_APP_API_BASE}/api/cart/add", {
        userId,
        itemId: item._id,
        name: item.name,
        price: item.price,
        image: item.images[0],
        quantity,
      });
      alert("Item added to cart successfully!");
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  const handlePurchase = async () => {
    navigate("/user-details", { state: { userId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden grid md:grid-cols-2 gap-12 p-12 relative">
        {/* Decorative Elements */}
        <div className="absolute top-6 right-6 flex space-x-4">
          <div>
        <button
        onClick={() => setIsModalOpen(true)}
        className="bg-white/70 p-3 rounded-full shadow-md hover:bg-white transition group"
      >
        <ShareIcon className="h-6 w-6 text-gray-700 group-hover:text-blue-500 transition" />
      </button>
      </div>
        {/* Share Modal */}
        {/* {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Share Your Discovery!</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <ShareIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center mb-4">
              <img src={item.images[0]} alt={item.name} className="h-16 w-16 rounded-lg mr-4" />
              <p>{item.name}</p>
            </div>
            <div className="flex items-center mb-4">
              <input
                type="text"
                value={product.productUrl}
                readOnly
                className="flex-1 p-2 border rounded-l-md"
              />
              <button onClick={handleCopyLink} className="bg-red-600 text-white px-4 py-2 rounded-r-md">
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )} */}
      {isModalOpen && (
  <div className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">Share Your Discovery!</h3>
          <button 
            onClick={() => setIsModalOpen(false)} 
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors duration-300"
          >
            <ShareIcon className="h-6 w-6" />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <img 
            src={item.images[0]} 
            alt={item.name} 
            className="h-20 w-20 rounded-xl object-cover shadow-md"
          />
          <div>
            <p className="text-lg font-semibold text-gray-800">{item.name}</p>
            <p className="text-sm text-gray-500">Ready to share your find?</p>
          </div>
        </div>
        
        <div className="flex shadow-sm rounded-lg overflow-hidden">
          <input
            type="text"
            value={product.productUrl}
            readOnly
            className="flex-1 p-3 bg-gray-100 text-gray-700 focus:outline-none"
          />
          <button 
            onClick={handleCopyLink} 
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-5 py-3 hover:from-red-700 hover:to-pink-700 transition-all duration-300 active:scale-95"
          >
            Copy URL
          </button>
        </div>
      </div>
    </div>
  </div>
)}
          <button className="bg-white/70 p-3 rounded-full shadow-md hover:bg-white transition group">
            <HeartIcon className="h-6 w-6 text-gray-700 group-hover:text-red-500 transition" />
          </button>
        </div>

        {/* Product Image Gallery */}
        <div className="space-y-6">
          <div className="relative group overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-black/10 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <SparklesIcon className="h-16 w-16 text-white/80" />
            </div>
            <img 
              src={item.images[activeImage]} 
              alt={item.name} 
              className="w-full h-[500px] object-cover 
              transform transition-transform duration-500 
              group-hover:scale-110"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="flex space-x-4">
            {item.images.map((img, index) => (
              <div 
                key={index}
                onClick={() => setActiveImage(index)}
                className="cursor-pointer relative group"
              >
                <div className={`absolute inset-0 z-10 bg-black/20 
                  ${activeImage === index ? 'opacity-0' : 'group-hover:opacity-100 opacity-0'} 
                  transition-opacity duration-300`}></div>
                <img 
                  src={img} 
                  alt={`${item.name} thumbnail ${index + 1}`}
                  className={`w-24 h-24 object-cover rounded-xl 
                    transform transition-all duration-300 
                    ${activeImage === index 
                      ? 'border-4 border-yellow-500 scale-110' 
                      : 'opacity-70 hover:opacity-100'}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 
              bg-gradient-to-r from-gray-800 to-gray-600 
              text-transparent bg-clip-text">{item.name}</h1>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex">{renderStars(4.2)}</div>
              <span className="text-gray-600 text-sm bg-gray-100 px-2 py-1 rounded-full">
                24 Customer Reviews
              </span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed text-lg mb-8 
            border-l-4 border-yellow-500 pl-4">{item.description}</p>

          <div className="flex items-center space-x-6 mb-8">
            <span className="text-5xl font-extrabold text-transparent 
              bg-gradient-to-r from-yellow-600 to-yellow-400 
              bg-clip-text">₹{item.price}</span>
            <span className="line-through text-gray-400 text-2xl">
              ₹{(item.price * 1.2).toFixed(2)}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1.5 
              rounded-full text-base font-semibold shadow-sm">
              20% OFF
            </span>
          </div>

          {/* Shipping & Security Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 
              p-4 rounded-xl flex items-center space-x-3 
              transform transition-transform hover:scale-105">
              <TruckIcon className="h-8 w-8 text-blue-500" />
              <div>
                <h4 className="font-semibold text-gray-800">Free Shipping</h4>
                <p className="text-sm text-gray-600">On orders over ₹1000</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 
              p-4 rounded-xl flex items-center space-x-3 
              transform transition-transform hover:scale-105">
              <ShieldCheckIcon className="h-8 w-8 text-green-500" />
              <div>
                <h4 className="font-semibold text-gray-800">Secure Payment</h4>
                <p className="text-sm text-gray-600">SSL Certified</p>
              </div>
            </div>
          </div>

          {/* Product Specifications */}
          <div className="border-t-2 border-gray-200 pt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 
              flex items-center">
              <SparklesIcon className="h-6 w-6 mr-3 text-yellow-500" />
              Product Specifications
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Weight Specification with Attractive Design */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 
                p-4 rounded-xl flex items-center space-x-3 
                transform transition-transform hover:scale-105 
                shadow-md hover:shadow-lg">
                <ScaleIcon className="h-8 w-8 text-purple-500" />
                <div>
                  <h4 className="font-semibold text-gray-800">Product Weight</h4>
                  <p className="text-lg text-purple-700 font-bold">
                    {item.weight} {item.weightUnit || 'g'}
                  </p>
                </div>
              </div>

              {/* Additional Specifications */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 
                p-4 rounded-xl flex items-center space-x-3 
                transform transition-transform hover:scale-105 
                shadow-md hover:shadow-lg">
                <SparklesIcon className="h-8 w-8 text-indigo-500" />
                <div>
                  <h4 className="font-semibold text-gray-800">Material</h4>
                  <p className="text-lg text-indigo-700 font-bold">
                    {item.material || 'Premium Quality'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="flex items-center border-2 rounded-xl 
              shadow-sm hover:shadow-md transition">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="px-5 py-3 text-gray-600 hover:bg-gray-100 
                rounded-l-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                -
              </button>
              <span className="px-6 py-3 text-lg font-semibold 
                bg-gray-50">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="px-5 py-3 text-gray-600 hover:bg-gray-100 
                rounded-r-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-6">
            <button 
              onClick={() => addToCart(item)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 
              text-white py-4 rounded-xl hover:from-yellow-600 hover:to-yellow-700 
              transition duration-300 flex items-center justify-center space-x-3 
              font-semibold text-lg shadow-lg hover:shadow-xl 
              transform hover:-translate-y-1"
            >
              <ShoppingCartIcon className="h-7 w-7" />
              <span>Add to Cart</span>
            </button>
            <button 
              onClick={handlePurchase}
              className="bg-gradient-to-r from-gray-200 to-gray-300 
              text-gray-800 py-4 rounded-xl hover:from-gray-300 hover:to-gray-400 
              transition duration-300 font-semibold text-lg shadow-md 
              flex items-center justify-center hover:shadow-lg 
              transform hover:-translate-y-1"
            >
              <GiftIcon className="h-7 w-7 mr-3" />
              Buy Now
            </button>
          </div>

          {/* Product Details */}
          <div className="border-t-2 border-gray-200 pt-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 
              flex items-center">
              <SparklesIcon className="h-6 w-6 mr-3 text-yellow-500" />
              Product Details
            </h3>
            <ul className="space-y-3 text-gray-600 text-base">
              {["Handcrafted with premium materials", 
                "Elegant design for any occasion", 
                "Comes with a protective jewelry box"].map((detail, index) => (
                <li key={index} className="flex items-center space-x-3 
                  bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
                  <span className="text-green-500">✓</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;