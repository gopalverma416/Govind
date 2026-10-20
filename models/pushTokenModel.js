const mongoose = require("mongoose");

// Expo push tokens for the owner app, one per admin device
const PushTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true, unique: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PushToken", PushTokenSchema);
