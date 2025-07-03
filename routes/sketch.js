const express = require("express");
const router = express.Router(); // Fix Router issue
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { upload, uploadToCloudinary } = require("../cloudinaryConfig");
const Sketch = require("../models/sketchModel");

// Fetch Sketch Images
router.get("/sketch", async (req, res) => {
  try {
    const sketches = await Sketch.find(); // Avoid redeclaring `Sketch`
    res.json(sketches);
  } catch (err) {
    console.error("Error in fetching the sketch images", err);
    res.status(500).json({ message: "Failed to fetch sketch images" });
  }
});

// Upload Sketch Image
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

module.exports = router;



