import React from 'react';
import { useState } from 'react';
import { Camera, Instagram, Facebook, Twitter, Youtube, MessageCircle, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle subscription logic here
    setEmail('');
    alert('Thank you for subscribing!');
  };

  return (
    <footer className="bg-amber-950 text-amber-100 py-12">
      {/* Gold accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 mb-8"></div>

      <div className="container mx-auto px-6">
        {/* Newsletter signup */}
        <div className="mb-12 text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-serif mb-4 text-amber-200">Join the Govind Jewellers Family</h2>
          <p className="mb-6 text-amber-200/80">Subscribe to receive exclusive offers, new collection alerts and styling inspirations.</p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 bg-amber-900/50 border border-amber-700 text-amber-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder-amber-300/50 flex-grow"
              placeholder="Your email address"
              required
            />
            <button type="submit" className="px-6 py-3 bg-amber-700 hover:bg-amber-600 text-white rounded-md transition duration-300 font-medium">
              Subscribe
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* App download section */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif mb-6 text-amber-200 relative after:absolute after:w-12 after:h-0.5 after:bg-amber-400 after:-bottom-2 after:left-0">
              Our Mobile App
            </h3>
            <div className="bg-gradient-to-b from-amber-900 to-amber-950 p-4 rounded-lg inline-block mb-4">
              <img src="https://res.cloudinary.com/denstpvkw/image/upload/v1742735326/Untitled_hvs3xy.png" alt="QR Code" className="w-32 h-32" />
            </div>
            <p className="text-sm mb-4">Scan to download our exclusive app</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="bg-black hover:bg-gray-900 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                <Camera size={16} />
                <span>Play Store</span>
              </button>
              <button className="bg-black hover:bg-gray-900 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                <Camera size={16} />
                <span>App Store</span>
              </button>
            </div>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif mb-6 text-amber-200 relative after:absolute after:w-12 after:h-0.5 after:bg-amber-400 after:-bottom-2 after:left-0">
              Shopping
            </h3>
            <ul className="space-y-3">
              {['Delivery Information', 'International Shipping', 'Payment Options', 'Track Your Order', 'Returns', 'Find a Store'].map((item, index) => (
                <li key={index} className="hover:text-amber-300 transition-colors cursor-pointer">
                  <span className="text-amber-400 mr-2">›</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif mb-6 text-amber-200 relative after:absolute after:w-12 after:h-0.5 after:bg-amber-400 after:-bottom-2 after:left-0">
              Information
            </h3>
            <ul className="space-y-3">
              {['Our Heritage', 'Craftsmanship', 'Gold Care Guide', 'Blog', 'Offers & Contests', 'Help & FAQs', 'About Us'].map((item, index) => (
                <li key={index} className="hover:text-amber-300 transition-colors cursor-pointer">
                  <span className="text-amber-400 mr-2">›</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-serif mb-6 text-amber-200 relative after:absolute after:w-12 after:h-0.5 after:bg-amber-400 after:-bottom-2 after:left-0">
              Connect with Us
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-800 p-2 rounded-full">
                  <Phone size={16} className="text-amber-200" />
                </div>
                <div>
                  <p className="text-amber-200">Customer Support</p>
                  <p>+91 7247305879</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-amber-800 p-2 rounded-full">
                  <Phone size={16} className="text-amber-200" />
                </div>
                <div>
                  <p className="text-amber-200">Toll Free</p>
                  <p>7247305879</p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button className="bg-amber-800 hover:bg-amber-700 p-3 rounded-full transition-colors">
                <MessageCircle size={18} />
              </button>
              <button className="bg-amber-800 hover:bg-amber-700 p-3 rounded-full transition-colors">
                <Mail size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Social and Payment Section */}
        <div className="mt-16 pt-8 border-t border-amber-800">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            {/* Social icons */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-amber-200 hover:text-amber-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-amber-200 hover:text-amber-400 transition-colors">
                <Youtube size={20} />
              </a>
            </div>

            {/* Payment methods */}
            <div className="flex gap-4 items-center">
              <span className="text-sm text-amber-300">Secure Payments:</span>
              <div className="flex space-x-3">
                <div className="bg-white p-1 rounded-md w-10 h-6 flex items-center justify-center">
                  <img src="https://res.cloudinary.com/denstpvkw/image/upload/v1742736157/vecteezy_visa-logo-png-visa-icon-transparent-png_20975576_nk4rhj.png" alt="Visa" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white p-1 rounded-md w-10 h-6 flex items-center justify-center">
                  <img src="https://res.cloudinary.com/denstpvkw/image/upload/v1742736232/vecteezy_mastercard-icon-symbol-logo_55687058_cxmklw.png" alt="Mastercard" className="w-full h-full object-contain" />
                </div>
                <div className="bg-white p-1 rounded-md w-10 h-6 flex items-center justify-center">
                  <img src="https://res.cloudinary.com/denstpvkw/image/upload/v1742735992/vecteezy_paypal-transparent-png-paypal-free-png_19909676_ht1cpq.png" alt="PayPal" className="w-full h-full object-contain" />
                </div>
              </div>
            </div>

            {/* Copyright */}
            <div className="text-center lg:text-right text-sm text-amber-200/70">
              © 2025 Govind Jewellers. All Rights Reserved.
            </div>
          </div>
        </div>

        {/* Bottom gold accent */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300 mt-8"></div>
      </div>
    </footer>
  );
};

export default Footer;