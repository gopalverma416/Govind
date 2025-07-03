const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/userModel");
const  adminMiddleware =require('../middleware/adminMiddleware');
const mongoose = require("mongoose");
const { upload, uploadToCloudinary } = require("../cloudinaryConfig");
const Slideshow =require('../models/Slideshow');
const Sketch = require("../models/sketchModel");
const Chat=require("../models/chatModel");
const Payment=require('../models/payment');
const Cart= require('../models/cartModel');


router.get("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ msg: "Access denied" });
  }

  try {
    const messages = await Chat.find().populate("userId", "name email"); // Get messages with user info
    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});


router.get("/payment",  async (req, res) => {
  try {
    const payments = await Payment.find().populate("userId", "firstName lastName phone street district pincode");
    const carts = await Cart.find().populate("userId", "firstName lastName phone").populate("items.itemId");

    const result = payments.map((payment) => {
      const cart = carts.find((c) => c.userId.toString() === payment.userId.toString());
      return {
        userId: payment.userId,
        userDetails: payment,
        cartDetails: cart ? cart.items : [],
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching payment and cart details:", error);
    res.status(500).json({ message: "Failed to fetch details" });
  }
});
router.get("/orders-stats", async (req, res) => {
  try {
    const totalOrders = await Payment.countDocuments();
    const totalSales = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    res.json({
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
    });
  } catch (error) {
    console.error("Error fetching orders stats:", error);
    res.status(500).json({ error: error.message });
  }
});




router.get("/slideshow", async (req, res) => {
    try {
      const slides = await Slideshow.find(); // Fetch all slides
      res.json(slides);
    } catch (error) {
      console.error("Error fetching slideshow images:", error);
      res.status(500).json({ message: "Failed to fetch slideshow images" });
    }
  });

router.post("/upload", authMiddleware,adminMiddleware,upload.single("image") , async (req, res) => {

    if (!req.file) {
        return res.status(400).json({ message: "Image upload failed!" });
      }
      const imageUrl = await uploadToCloudinary(req.file.path);
      console.log(imageUrl);
     try {
        
        const newSlide = new Slideshow({ imageUrl });

        await newSlide.save();
       return   res.status(201).json(newSlide);
      } catch (err) {
        console.error("Error adding slideshow image item:");
        res.status(500).json({ message: "Failed to slideshow iamge" });
      }

       
  
});
router.put("/make-admin/:id", async (req, res) => {
    try {
      const { id } = req.params;
  
      // Check if the ID is a valid MongoDB ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid user ID format" });
      }
  
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
  
      user.role = "admin";
      await user.save();
      res.json({ message: "User promoted to admin" });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ error: "Server error" });
    }
  });

  //sketch section
  router.post(
  "/upload-sketch",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    try {
      const imageUrl = await uploadToCloudinary(req.file.path);
      console.log(imageUrl);

      const newSketch = new Sketch({ imageUrl });
      await newSketch.save();
      
      return res.status(201).json(newSketch);
    } catch (err) {
      console.error("Error adding sketch image item:", err);
      res.status(500).json({ message: "Failed to upload sketch image" });
    }
  }
);

router.get("/sketch", async (req, res) => {
  try {
    const sketches = await Sketch.find(); // Avoid redeclaring `Sketch`
    res.json(sketches);
  } catch (err) {
    console.error("Error in fetching the sketch images", err);
    res.status(500).json({ message: "Failed to fetch sketch images" });
  }
});


module.exports = router;
