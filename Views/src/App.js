import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Users from './components/Users';
import Signup from './components/Signup';
import Login from './components/Login';
import Home from './components/Home';
import GlobalNav from './components/site/GlobalNav';
import { Navigate } from 'react-router-dom';
import Purchase from './components/Purchase';
import Jwellery from './components/JewelryList';
import Account from './components/Account';
import AdminDashboard from './components/Admin'
import ForgotPassword from './components/ForgotPassword';
import Chat from './components/Chat';
import UserDetailsForm from "./components/UserDetailsForm";
import Payment from "./components/PaymentPage";
import Thankyou from "./components/Thankyou";
import { initGA, trackPageView } from "./components/analytics";
import { useLocation } from 'react-router-dom';
import { useEffect } from "react";
import ProductDetails from "./components/ProductDetails";
import UploadForm from './components/UploadForm';
import WishlistPage from './components/WishlistPage';
import GoldRatePage from './components/GoldRatePage';
import WhatsAppButton from './components/site/WhatsAppButton';



// import PhoneVerification from './components/phone';
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
};
const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

const App = () => {
  useEffect(() => {
    initGA();
  }, []);

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <GlobalNav />

      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path='/purchase' element={<PrivateRoute><Purchase /></PrivateRoute>} />
        <Route path="/list" element={<Jwellery/>} />
        <Route path="/account" element={<Account/>} />
        <Route path="/admin" element={<AdminDashboard/>} />
        <Route path="/forget" element={<ForgotPassword/>} />
        <Route path="/chat" element={<Chat/>} />
        <Route path="/user-details" element={<UserDetailsForm />} />
        <Route path="/payment" element={<Payment/>} />
        <Route path="/thank-you" element={<Thankyou/>} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/upload-form" element={<UploadForm/>} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/gold-rate" element={<GoldRatePage />} />
        


        {/* <Route path="/phone" element={<PhoneVerification/>} /> */}
        

      </Routes>
      <WhatsAppButton />
    </BrowserRouter>
  );
};

export default App;
