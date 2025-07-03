const express = require("express");
const Chat = require("../models/chatModel");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get chat history with a specific user
router.get("/:receiverId", authMiddleware, async (req, res) => {
  try {
    const messages = await Chat.find({
      $or: [
        { sender: req.user.id, receiver: req.params.receiverId },
        { sender: req.params.receiverId, receiver: req.user.id },
      ],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Save new message
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { receiver, message } = req.body;
    const newChat = new Chat({
      sender: req.user.id,
      receiver,
      message,
    });
    await newChat.save();
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
