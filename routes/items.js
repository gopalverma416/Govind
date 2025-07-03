const express = require("express");
const Item = require("../models/itemModel"); 
const router = express.Router();
const multer = require("multer");
const path = require("path"); 
const fs = require("fs"); 
const { upload, uploadToCloudinary } = require("../cloudinaryConfig");
const { findByIdAndDelete } = require("../models/userModel");
const mongoose = require("mongoose");



// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../cloudinaryConfig");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: {
//     folder: "jewelry-images",
//     allowed_formats: ["jpg", "png", "jpeg"],
//   },
// }); 
// const uploadPath = path.join(__dirname, "../uploads");
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }

// const storage=multer.diskStorage({
//   destination:function(req,res,cb){
   
//     cb(null,uploadPath); 
//   },
//   filename:function(req,file,cb){
//     return cb(null,`${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage:storage });

// GET all items
router.get("/", async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    console.error("Error fetching items:", err.message);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// delete the item 
router.delete("/remove/:id",async(req,res)=>{
try{

  const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid item ID" });
    }
    const itemExists = await Item.findById(id);
    if (!itemExists) {
      return res.status(404).json({ error: "Item not found before deleting" });
     }

  const items=await Item.findByIdAndDelete(id);
  if(!items){
    return res.status(404).json({ error: "Item not found in delete route" });
  }
  res.json({ message: "Item removed successfully", items });
}catch(err){
  console.error("Error removing item:", err);
  res.status(500).json({ error: "Server error while removing item" });
}
});

// POST new item
router.post("/", upload.single("image"), async (req, res) => {
  const { name, price, category } = req.body; // Added category

  // Ensure file was uploaded
  if (!req.file) {
    return res.status(400).json({ message: "Image upload failed!" });
  }

  const imageUrl = await uploadToCloudinary(req.file.path);

  // Validation
  if (!name || !price || !category) {
    return res.status(400).json({ message: "All fields are required" });
  }
  if (isNaN(price)) {
    return res.status(400).json({ message: "Price must be a number" });
  }

  try {
    const newItem = new Item({ name, price, category, image: imageUrl }); // Added category
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error adding item:", err);
    res.status(500).json({ message: "Failed to add item" });
  }
});

//search by category 
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Item.find({ category });

    if (products.length === 0) {
      return res.status(404).json({ message: "No products found in this category" });
    }

    res.json(products);
  } catch (error) {
    console.error("Error fetching category items:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
//fetch all categories
router.get("/categories", async (req, res) => {
  try {
    const categories = await Item.distinct("category"); // Fetch unique categories
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;

