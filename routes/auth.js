const express = require("express");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
require("dotenv").config();
const nodemailer = require("nodemailer");
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const router = express.Router();

const otpStore = new Map(); 

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "digitalsrijan24tooryanaad@gmail.com",
    pass: "nkhd eiym roez lgzi",
  },
});

// Step 1: Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  console.log("OTP request received for:", email);


  if (!user) return res.status(404).json({ msg: "User not found" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
  otpStore.set(email, { otp, expiresAt: Date.now() + 5 * 60 * 1000 }); // Valid for 5 minutes

  // Send OTP via email
  await transporter.sendMail({
    from: "digitalsrijan24tooryanaad@gmail.com",
    to: email,
    subject: "Password Reset OTP",
    // text: `Your OTP is: ${otp}. It will expire in 2 minutes.`,
    html: `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background-color: #f0f2f5;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .otp-container {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            padding: 30px;
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        .logo {
            margin-bottom: 20px;
        }
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #8B4513;
            letter-spacing: 2px;
        }
        .otp-header {
            color: #333;
            margin-bottom: 15px;
        }
        .otp-code {
            background-color: #f9f9f9;
            border: 2px dashed #8B4513;
            border-radius: 8px;
            font-size: 28px;
            font-weight: bold;
            color: #8B4513;
            letter-spacing: 8px;
            padding: 15px;
            margin: 20px 0;
            display: inline-block;
        }
        .time-note {
            color: #666;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .security-warning {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: left;
        }
        .disclaimer {
            font-size: 12px;
            color: #888;
            border-top: 1px solid #e0e0e0;
            padding-top: 15px;
            margin-top: 20px;
        }
        .security-note {
            color: #d9534f;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="otp-container">
        <div class="logo">
            <div class="logo-text">Govind Jewellers</div>
        </div>
        
        <h2 class="otp-header">Password Reset Request</h2>
        
        <p>You have requested to reset your password. Please use the One-Time Password (OTP) below:</p>
        
        <div class="otp-code">${otp}</div>
        
        <div class="time-note">
            <p>This OTP is valid for <strong>2 minutes</strong> from the time of this email.</p>
            <p>The OTP will automatically expire after 2 minutes for your security.</p>
        </div>
        
        <div class="security-warning">
            <strong>IMPORTANT SECURITY INSTRUCTIONS:</strong>
            <ul>
                <li>Do NOT share this OTP with anyone, including Govind Jewellers staff.</li>
                <li>This OTP is for your exclusive use and should be kept confidential.</li>
                <li>Govind Jewellers will never ask you to share your OTP via email, phone, or message.</li>
                <li>If you suspect any misuse, contact our customer support immediately.</li>
            </ul>
        </div>
        
        <p>If you did not request a password reset, please ignore this email and contact our support team.</p>
        
        <div class="disclaimer">
            <p class="security-note">WARNING: Protect Your Account</p>
            This is an automated message. Please do not reply to this email.
            <br>For assistance, contact our customer support at support@govindjewellers.com
        </div>
    </div>
</body>
</html>
  `
  });

  res.json({ msg: "OTP sent successfully" });
});

//otp verifucation

router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  const storedOtp = otpStore.get(email);
  console.log(storedOtp);

  if (!storedOtp || storedOtp.otp !== parseInt(otp) || storedOtp.expiresAt < Date.now()) {
    return res.status(400).json({ msg: "Invalid or expired OTP" });
  }

  otpStore.delete(email); // Remove OTP after verification
  const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "10m" });
console.log(token);
  res.json({ msg: "OTP verified", token });
});
//reset password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;
  console.log("we r in the reset password zone");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log(decoded);
    if (!decoded.email) {
    return res.status(400).json({ msg: "Invalid token data" });
     }

    console.log("Decoded Token:", decoded); // Debugging

    
    const user = await User.findOne({ email: decoded.email });
    console.log({user:user});
    if (!user) return res.status(404).json({ msg: "User not found" });

    user.password = newPassword;
    console.log({user:user});
    user.markModified("password");

    await user.save({ validateBeforeSave: false }); 
   
   
    res.json({ msg: "Password reset successful" });
  } catch (err) {
    res.status(400).json({ msg: "Invalid or expired token" });
  }
});


//google login 
router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
    // Verify the Google token using Google API
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    // Check if user exists
    let user = await User.findOne({ email });

    // If user doesn't exist, create a new one
    if (!user) {
      user = await User.create({
        name,
        email,
        password: '', // No password for Google login
        address: '',
        age: 0,
        gender: '',
        weight: 0,
        role: 'user',
      });
    }

    // Generate JWT Token
    const appToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ msg: 'Login successful', token: appToken, user });
  } catch (error) {
    console.error('Google Login Error:', error.message);
    res.status(400).json({ msg: 'Google login failed' });
  }
});
//signup-through google
router.post('/google-signup', async (req, res) => {
  const { token, age, gender, address, weight } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ msg: 'User already exists. Please login.' });
    }

    // Create a new user
    user = await User.create({
      name,
      email,
      password: 'google_auth',
      role: 'user',
      age,
      gender,
      address,
      weight,
    });

    // Generate JWT Token
    const appToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ msg: 'Signup successful', token: appToken, user });
  } catch (error) {
    console.error('Google Signup Error:', error.message);
    res.status(400).json({ msg: 'Google signup failed' });
  }
});

// Signup Route
router.post("/signup", async (req, res) => {
  console.log("start");
  try {
    const { name, email, password, address, age, gender, weight } = req.body;
    if (!name || !email || !password || !address || !age ||  !gender || !weight ) return res.status(400).json({ msg: "All fields are required" });

    if (await User.findOne({ email })) return res.status(400).json({ msg: "User already exists"});

    const user = await User.create({ name, email, password, address, age, gender, weight,role: "user" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ msg: "Signup successful", user, token});
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
    console.log("login started");
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ msg: "Invalid Credentials" });
    
    console.log("User found:,login route", user);

    //token 
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || "default_secret", { expiresIn: "1h" });
      
    res.json({ msg: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
});



module.exports = router;
