import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, DollarSign, MapPin, ShoppingCart, CheckCircle } from "lucide-react";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = location.state || {};

  const [cart, setCart] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [userDetails, setUserDetails] = useState(location.state?.formData || {});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Cart Details
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`https://govind-jwellers.onrender.com/api/cart/${userId}`);
        if (response.data.cart) {
          setCart(response.data.cart);
          setTotalPrice(response.data.cart.reduce((sum, item) => sum + item.itemId.price * item.quantity, 0));
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };
    fetchCart();
  }, [userId]);

  // Handle Payment Submission
  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post("https://govind-jwellers.onrender.com/api/payment", {
        userId,
        ...userDetails,
        paymentMethod,
      });
      
      if (response.status === 201) {
        alert("Payment successful!");
        navigate("/thank-you");
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 pt-40 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden">
        <div className="p-6 bg-blue-600 text-white flex items-center">
          <CreditCard className="mr-3" size={24} />
          <h2 className="text-2xl font-bold">Payment Confirmation</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* User Details Section */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <MapPin className="mr-2 text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-blue-800">User Details</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-gray-700">
              <p><strong>Name:</strong> {userDetails.firstName} {userDetails.lastName}</p>
              <p><strong>Phone:</strong> {userDetails.phone}</p>
              <p className="col-span-2"><strong>Address:</strong> {userDetails.street}, {userDetails.district}, {userDetails.pincode}</p>
            </div>
          </div>

          {/* Cart Section */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center mb-4">
              <ShoppingCart className="mr-2 text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-green-800">Cart Details</h3>
            </div>
            {cart.length > 0 ? (
              <ul className="space-y-2">
                {cart.map((item, index) => (
                  <li key={index} className="flex justify-between border-b pb-2 last:border-b-0">
                    {/* <span>{item.itemId.name}</span> */}
                    {/* <span>₹{item.itemId.price} x {item.quantity}</span> */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Your cart is empty.</p>
            )}
            <div className="mt-4 text-right font-bold text-green-800 flex justify-between items-center">
              <DollarSign className="text-green-600" size={20} />
              <p>Total Price: ₹{totalPrice}</p>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block mb-4">
              <span className="text-gray-700 flex items-center">
                <CreditCard className="mr-2 text-purple-600" size={20} />
                Select Payment Method
              </span>
              <select 
                value={paymentMethod} 
                onChange={(e) => setPaymentMethod(e.target.value)} 
                className="mt-2 block w-full p-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-400 transition"
              >
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </label>
          </div>

          {/* Payment Button */}
          <button 
            onClick={handlePayment} 
            disabled={isLoading}
            className={`w-full flex items-center justify-center py-3 px-6 rounded-xl text-white font-bold transition ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-400'
            }`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2" size={20} />
                Confirm and Pay
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;