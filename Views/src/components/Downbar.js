import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiUser, FiHeart, FiShoppingBag, FiMenu } from 'react-icons/fi';

const DownBarMenuNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = ['All Jewellery', 'Gold', 'Diamond', 'Earrings', 'Rings', 'Daily Wear', 'Collections', 'Wedding', 'Gifting'];

  return (
    <div className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Navbar Section */}
      <div className="container mx-auto flex justify-between items-center py-4 px-4">
        <Link to="/" className="text-2xl font-bold text-gray-800">Govind Jewellers</Link>

        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-lg">
          <FiSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search for Gold Jewellery, Diamond, and more..."
            className="bg-transparent focus:outline-none w-full"
          />
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-4">
          <FiUser className="text-gray-700 cursor-pointer" />
          <FiHeart className="text-gray-700 cursor-pointer" />
          <FiShoppingBag className="text-gray-700 cursor-pointer" />
        </div>
      </div>

      {/* Category Navbar */}
      <div className="bg-white border-t">
        <div className="container mx-auto flex items-center justify-between py-3 px-4">
          <button className="lg:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <FiMenu className="text-gray-800" size={24} />
          </button>
          <div className={`lg:flex ${isMenuOpen ? 'block' : 'hidden'} space-x-6 w-full lg:w-auto`}>            
            {categories.map((category, index) => (
              <Link key={index} to={`/${category.toLowerCase().replace(/ /g, '-')}`} className="text-gray-700 hover:text-gray-900">
                {category}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownBarMenuNavbar;
