import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest('nav')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white text-gray-800 shadow-lg py-2" 
        : "bg-gradient-to-r from-amber-700 via-yellow-600 to-amber-600 text-white py-4"
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <span className={`text-2xl font-bold transition-colors duration-300 ${
            scrolled ? "text-amber-600" : "text-white"
          }`}>
            Govind <span className="font-light italic">Jewellers</span>
          </span>
        </Link>

        {/* Hamburger Menu */}
        <button
          className="md:hidden focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X size={28} className={scrolled ? "text-amber-600" : "text-white"} />
          ) : (
            <Menu size={28} className={scrolled ? "text-amber-600" : "text-white"} />
          )}
        </button>

        {/* Navigation Links */}
        <div className={`fixed md:static inset-0 md:inset-auto pt-16 md:pt-0 bg-white md:bg-transparent md:flex items-center transition-all duration-300 ease-in-out transform ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full md:translate-x-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
        }`}>
          <ul className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-1 p-6 md:p-0">
            <li>
              <Link 
                to="/" 
                className={`block px-4 py-2 rounded-full transition-colors duration-300 hover:bg-amber-50 ${
                  scrolled ? "text-gray-800 hover:text-amber-600" : "md:text-white text-gray-800 md:hover:bg-white/20 hover:text-amber-700 md:hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                to="/list" 
                className={`block px-4 py-2 rounded-full transition-colors duration-300 hover:bg-amber-50 ${
                  scrolled ? "text-gray-800 hover:text-amber-600" : "md:text-white text-gray-800 md:hover:bg-white/20 hover:text-amber-700 md:hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                Jewellery
              </Link>
            </li>
            <li>
              <Link
                to="/purchase"
                className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-colors duration-300 hover:bg-amber-50 ${
                  scrolled ? "text-gray-800 hover:text-amber-600" : "md:text-white text-gray-800 md:hover:bg-white/20 hover:text-amber-700 md:hover:text-white"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Cart</span>
              </Link>
            </li>

            {isAuthenticated ? (
              <li>
                <Link
                  to="/account"
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full transition-colors duration-300 hover:bg-amber-50 ${
                    scrolled ? "text-gray-800 hover:text-amber-600" : "md:text-white text-gray-800 md:hover:bg-white/20 hover:text-amber-700 md:hover:text-white"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <UserCircleIcon className="h-5 w-5" />
                  <span>Account</span>
                </Link>
              </li>
            ) : (
              <>
                <li className="md:ml-4">
                  <Link
                    to="/login"
                    className={`block px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      scrolled 
                        ? "bg-amber-600 text-white hover:bg-amber-700" 
                        : "bg-white text-amber-700 hover:bg-amber-50"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/signup"
                    className={`block px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                      scrolled 
                        ? "bg-gray-100 text-amber-700 border border-amber-600 hover:bg-gray-200" 
                        : "bg-amber-800 text-white hover:bg-amber-900"
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    Signup
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;