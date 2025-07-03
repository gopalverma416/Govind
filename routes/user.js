const express = require('express');
const router = express.Router();
const UserDetails = require('../models/userDetails');
router.get("/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
  
      // ✅ Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
      }
  
      // ✅ Find user details using userId
      const userDetails = await UserDetails.findOne({ userId });
  
      // ✅ Check if user details exist
      if (!userDetails) {
        return res.status(404).json({ message: "User details not found" });
      }
  
      res.status(200).json(userDetails);
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  

router.post("/", async (req, res) => {
    const { userId, firstName, lastName, gender, phone, street, district, pincode } = req.body;
  
    if (!userId || !firstName || !lastName || !gender || !phone || !street || !district || !pincode) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const userDetails = new UserDetails({
        userId,
        firstName,
        lastName,
        gender,
        phone,
        street,
        district,
        pincode,
      });
  
      await userDetails.save();
      console.log("User details saved:", userDetails);
      res.status(201).json({ message: "User details submitted successfully", userDetails });
    } catch (error) {
      console.error("Error saving user details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

module.exports = router;  
