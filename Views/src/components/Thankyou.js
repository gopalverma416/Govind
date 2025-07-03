import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const ThankYouPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border border-gold-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gold-500 to-gold-600 p-8 text-center">
          <CheckCircle 
            className="mx-auto mb-4 text-white" 
            size={80} 
            strokeWidth={1.5}
          />
          <h1 className="text-3xl font-bold text-white">
            Thank You for Your Purchase!
          </h1>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-lg text-gray-700 mb-6">
            Your order has been successfully processed. We appreciate your business and hope you enjoy your golden treasures!
          </p>
          
          <div className="bg-gold-50 p-4 rounded-lg mb-6 border border-gold-200">
            <h2 className="text-xl font-semibold text-gold-800 mb-2">
              Order Details
            </h2>
            <p className="text-gold-700">
              Order Number: <span className="font-bold">#{Math.floor(Math.random() * 1000000)}</span>
            </p>
            <p className="text-gold-700">
              Estimated Delivery: 3-5 Business Days
            </p>
          </div>
          
          <Link 
            to="/" 
            className="w-full flex items-center justify-center bg-gold-500 text-white py-3 rounded-lg hover:bg-gold-600 transition-colors duration-300 ease-in-out group"
          >
            <Home 
              className="mr-3 group-hover:animate-bounce" 
              size={24} 
            />
            Return to Home Page
          </Link>
        </div>
        
        <div className="bg-gold-100 p-4 text-center text-gold-700">
          <p className="text-sm">
            Questions? Contact our customer support at 
            <a 
              href="tel:+91-7247305879" 
              className="font-bold ml-1 hover:text-gold-800"
            >
              +91-7247305879
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;