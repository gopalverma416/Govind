import React, { useState } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../firebase";
import PhoneVerification from "../components/phone";


const Forgot = () => {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  const handleOtpVerified = () => {
    // Redirect to reset password page
    console.log("OTP Verified! Proceeding to reset password...");
  };


  const sendOtp = async () => {
    try {
      window.recaptchaVerifier = new RecaptchaVerifier("recaptcha-container", {
        size: "invisible",
      }, auth);

      const confirmation = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setVerificationId(confirmation.verificationId);
      setShowOtpInput(true);
      alert("OTP sent!");
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Failed to send OTP!");
    }
  };

  const verifyOtp = async () => {
    try {
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      await auth.signInWithCredential(credential);
      alert("OTP Verified! Redirecting to Reset Password...");
      // Redirect to reset password page
    } catch (error) {
      console.error("OTP Verification Failed:", error);
      alert("Invalid OTP!");
    }
  };

  return (
    <div>
        <div>
         <h1>Forgot Password</h1>
         <PhoneVerification onOtpVerified={handleOtpVerified} />
         </div>
    <div>
      <h2>Forgot Password (OTP Verification)</h2>
      <input
        type="text"
        placeholder="Enter Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button onClick={sendOtp}>Send OTP</button>
      <div id="recaptcha-container"></div>

      {showOtpInput && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
    </div>
    
  );
};

export default Forgot;
