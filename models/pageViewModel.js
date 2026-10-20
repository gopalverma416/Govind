const mongoose = require("mongoose");

// One storefront page view. Anonymous visitors are identified only by a random
// per-browser session id; signed-in customers also carry their userId.
const PageViewSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  path: { type: String, required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item" },
  referrer: String,
  device: { type: String, enum: ["mobile", "tablet", "desktop"], default: "desktop" },
  createdAt: { type: Date, default: Date.now, index: true, expires: 60 * 60 * 24 * 90 }, // kept 90 days
});

module.exports = mongoose.model("PageView", PageViewSchema);
