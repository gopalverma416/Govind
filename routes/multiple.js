const express = require("express");
const router = express.Router();
const { upload, uploadToCloudinary } = require("../cloudinaryConfig");
const Item = require("../models/itemModel");

router.post("/", upload.fields([{ name: "image1" }, { name: "image2" }]), async (req, res) => {
  const { name, price, category,weight } = req.body;

  // Ensure both images are uploaded
  if (!req.files || !req.files.image1 || !req.files.image2) {
    return res.status(400).json({ message: "Both images are required!" });
  }

  try {
    console.log("Files uploaded:", req.files);

    // Upload images to Cloudinary
    const imageUrl1 = await uploadToCloudinary(req.files.image1[0].path);
    const imageUrl2 = await uploadToCloudinary(req.files.image2[0].path);

    console.log("Uploaded image URLs:", imageUrl1, imageUrl2);

    // Validation
    if (!name || !price || !category||!weight) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (isNaN(price)) {
      return res.status(400).json({ message: "Price must be a number" });
    }

    // Save item with both images
    const newItem = new Item({ name, price, category,weight, images: [imageUrl1, imageUrl2] });
    await newItem.save();

    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

module.exports = router;
