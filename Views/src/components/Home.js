import React from 'react';
import { useNavigate } from "react-router-dom";
import Slideshow from './Slideshow';
import Sketch from './SketchbookGallery';
import Footbar from './Footbar';



const Home = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white overflow-hidden">
      {/* Hero Section with Slideshow */}
      <section className="relative">
        <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent to-gray-900 pointer-events-none"></div>
        <Slideshow />
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="text-center px-4 max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-4 tracking-tight text-white drop-shadow-lg">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-amber-500">Timeless Elegance</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-200 font-light max-w-2xl mx-auto">
              Discover jewelry crafted with passion, designed for generations
            </p>
            <button
              onClick={() => navigate("/list")}
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-amber-600 px-8 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:bg-amber-700"
            >
              <span className="relative z-10">Explore Collection</span>
              <span className="absolute inset-0 z-0 translate-y-12 rounded-full bg-amber-700 transition-transform duration-300 group-hover:translate-y-0"></span>
            </button>
          </div>
        </div>
      </section>

      {/* Sketchbook Section */}
      <section className="relative py-16 px-4">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center mb-12">
            <div className="h-px w-12 bg-amber-500"></div>
            <h2 className="text-3xl md:text-4xl font-bold mx-4 text-center text-amber-400 drop-shadow-md">
              Straight out of Sketchbook
            </h2>
            <div className="h-px w-12 bg-amber-500"></div>
          </div>
          <Sketch />
        </div>
      </section>

      {/* Featured Collection Section */}
      <section className="relative py-16 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-purple-900/30 to-gray-900/40 z-0"></div>
        <div className="absolute top-0 left-0 w-20 h-20 bg-amber-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <div className="md:w-1/2 space-y-6">
            <div className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-sm font-medium mb-2">
              Luxury Collection
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
              Crafted for the <span className="text-amber-400">Extraordinary</span>
            </h2>
            <p className="text-gray-300 text-lg">
              Each piece tells a story of artistry and tradition, designed to elevate your style and become family heirlooms.
            </p>
            <div className="pt-4">
              <button
                onClick={() => navigate("/list")}
                className="inline-flex items-center px-6 py-3 bg-white text-gray-900 rounded-full font-medium hover:bg-amber-500 transition-colors duration-300"
              >
                View Collection
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
  <div className="relative">
    <div className="absolute -inset-4 bg-amber-500/30 rounded-lg blur-xl"></div>
    <div className="relative bg-gray-800 p-1 rounded-lg shadow-2xl transform transition-all duration-500 hover:scale-105">
      <img 
        src="https://res.cloudinary.com/denstpvkw/image/upload/v1741432943/jewelry-images/cwcnzqtrrb9kaagfphgg.webp"
        alt="Featured jewelry collection" 
        className="rounded-lg w-full h-full object-cover"
      />
    </div>
  </div>
</div>

        </div>
      </section>

      {/* Testimonial/Call-to-Action Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto bg-gradient-to-r from-amber-900/30 to-gray-800/40 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-sm border border-amber-500/20">
          <div className="flex flex-col items-center text-center">
            <div className="inline-block rounded-full p-2 bg-amber-500/20 mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Experience the Govind Jewellers Difference</h2>
            <p className="text-lg text-gray-300 max-w-3xl mb-8">
              From traditional designs to contemporary masterpieces, our expert craftsmen bring your vision to life with unparalleled quality and attention to detail.
            </p>
            <button
              onClick={() => navigate("/list")}
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-900 bg-gradient-to-r from-amber-300 to-amber-500 rounded-full shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover:scale-105"
            >
              Explore Collections
              <span className="ml-2 group-hover:ml-4 transition-all duration-300">→</span>
            </button>
          </div>
        </div>
      </section>
      <section>
        {/* Footer */}
    
   <Footbar />
<footer className="bg-gray-800 text-white">
  <div className="max-w-7xl mx-auto px-8 text-center space-y-4">
    <p>© 2025 Elegant Jewels. All rights reserved.</p>
    <p className="text-gray-400 text-sm">Premium handcrafted jewelry for every occasion.</p>
  </div>
</footer>
      </section>
      
    </div>
  );
};

export default Home;