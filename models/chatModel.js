const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: String, required: true }, // "Admin" or UserId
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  // Customer messages start unread for the owner; replies from the owner are marked read
  seenByOwner: { type: Boolean, default: false },
});

module.exports = mongoose.model("Chat", ChatSchema);
