import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getUserIdFromToken } from "../utils/auth";
import { ShoppingCart, CreditCard, CheckCircle, Package, Truck, Shield, Trash2 } from "lucide-react";

const Purchase = () => {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Credit Card");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userId = getUserIdFromToken();
  console.log("User ID in Purchase:", userId);

  useEffect(() => {
    if (!userId) {
      alert("Please log in to view your cart.");
      navigate("/login");
      return;
    }

    setIsLoading(true);
    axios
      .get(`${process.env.REACT_APP_API_BASE}/api/cart/${userId}`)
      .then((response) => {
        setCartItems(response.data.cart || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching cart:", error);
        setIsLoading(false);
      });
  }, [userId, navigate]);

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const handleRemoveItem = async (itemId) => {
    try {
      console.log("Removing Item:", itemId._id);
      console.log("User ID:", userId);
      await axios.delete(`${process.env.REACT_APP_API_BASE}/api/cart/remove/${userId}/${itemId._id}`);
     
      const response = await axios.get(`${process.env.REACT_APP_API_BASE}/api/cart/${userId}`);
      setCartItems(response.data.cart || []);

    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  const handlePurchase = async () => {
    navigate("/user-details", { state: { userId } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-50 to-gold-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-gold-200 transform transition-all hover:scale-[1.01]">
          {/* Header */}
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-10 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-bold flex items-center gap-4">
                  <ShoppingCart className="h-10 w-10 text-white" />
                  Gold Checkout
                </h2>
                <p className="text-gold-100 mt-2 text-lg">Complete your luxury purchase</p>
              </div>
              <div className="bg-white/20 p-3 rounded-full">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-gold-500"></div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="mb-10">
                  <h3 className="text-2xl font-semibold text-gold-800 mb-6 flex items-center gap-3">
                    <Package className="h-7 w-7 text-gold-600" />
                    Your Selected Jewelry
                  </h3>

                  {cartItems.length > 0 ? (
                    <div className="space-y-6">
                      {cartItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center p-6 bg-gold-50 rounded-2xl border border-gold-200 hover:shadow-lg transition-all duration-300"
                        >
                          <div className="flex-shrink-0 mr-6">
                            <div className="h-24 w-24 rounded-xl overflow-hidden shadow-md">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gold-900 mb-2">{item.name}</h4>
                            <div className="flex items-center text-gold-700">
                              <span className="mr-4">Quantity: {item.quantity}</span>
                              <span className="mr-4">₹{item.price} each</span>
                              <button
                                onClick={() => handleRemoveItem(item.itemId)}
                                className="flex items-center text-red-500 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="mr-2 h-5 w-5" />
                                Remove
                              </button>
                            </div>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-gold-900">
                              ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-gold-50 rounded-2xl border border-gold-200">
                      <ShoppingCart className="h-16 w-16 text-gold-400 mx-auto mb-6" />
                      <p className="text-2xl text-gold-700 mb-4">Your cart is empty</p>
                      <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  )}
                </div>

                {/* Payment Method & Order Summary */}
                {cartItems.length > 0 && (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Payment Method */}
                    <div>
                      <h3 className="text-2xl font-semibold text-gold-800 mb-6 flex items-center gap-3">
                        <CreditCard className="h-7 w-7 text-gold-600" />
                        Payment Method
                      </h3>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full p-4 border-2 border-gold-300 rounded-xl focus:ring-2 focus:ring-gold-500 text-gold-800 bg-gold-50"
                      >
                        <option>Credit Card</option>
                        <option>UPI</option>
                        <option>Cash on Delivery</option>
                      </select>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h3 className="text-2xl font-semibold text-gold-800 mb-6">
                        Order Summary
                      </h3>
                      <div className="bg-gold-100 p-6 rounded-2xl border border-gold-200">
                        <div className="space-y-3 mb-4">
                          <div className="flex justify-between text-gold-700">
                            <span>Subtotal</span>
                            <span className="font-semibold">₹{totalPrice}</span>
                          </div>
                          <div className="flex justify-between text-gold-700">
                            <span>Shipping</span>
                            <span className="text-green-600 font-semibold">Free</span>
                          </div>
                          <div className="flex justify-between text-gold-700">
                            <span>Insurance</span>
                            <span className="font-semibold">Included</span>
                          </div>
                        </div>
                        <div className="border-t border-gold-300 my-4"></div>
                        <div className="flex justify-between">
                          <span className="text-2xl font-bold text-gold-900">Total</span>
                          <span className="text-2xl font-bold text-gold-900">₹{totalPrice}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {cartItems.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                    {[
                      { icon: Truck, title: "Free Insured Delivery", desc: "On all orders" },
                      { icon: Shield, title: "100% Authentic", desc: "BIS hallmarked gold" },
                      { icon: Package, title: "Lifetime Exchange", desc: "Best value guarantee" }
                    ].map((benefit, index) => (
                      <div 
                        key={index} 
                        className="flex flex-col items-center p-6 bg-gold-50 rounded-2xl border border-gold-200 hover:shadow-md transition-all"
                      >
                        <benefit.icon className="h-10 w-10 text-gold-500 mb-4" />
                        <h4 className="font-bold text-gold-800 mb-2">{benefit.title}</h4>
                        <p className="text-gold-600 text-sm">{benefit.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Purchase Button */}
                {cartItems.length > 0 && (
                  <button
                    onClick={handlePurchase}
                    disabled={isLoading}
                    className="w-full mt-10 py-5 rounded-xl text-white bg-gradient-to-r from-gold-500 to-gold-600 
                    hover:from-gold-600 hover:to-gold-700 
                    focus:outline-none focus:ring-4 focus:ring-gold-300
                    flex items-center justify-center gap-3 
                    transition-all duration-300 transform hover:scale-[1.02] shadow-xl"
                  >
                    {isLoading ? (
                      <div className="animate-spin h-6 w-6 border-3 border-white border-t-transparent rounded-full"></div>
                    ) : (
                      <>
                        <CheckCircle className="h-6 w-6" />
                        Complete Purchase
                      </>
                    )}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchase;