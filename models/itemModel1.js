const mongoose = require("mongoose");

const ItemSchema1 = new mongoose.Schema({
  name: String,
  price: Number,
  weight: Number,
  category: String,
  images: [String],  // Array to store two image URLs
},{ timestamps: true });

module.exports = mongoose.model("Item1", ItemSchema1);
