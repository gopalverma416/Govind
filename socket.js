const { Server } = require("socket.io");
const Chat = require("./models/chatModel");
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const { notifyOwners } = require("./lib/push");

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token || !token.startsWith("Bearer ")) {
      return next(new Error("Access Denied. No Token Provided."));
    }

    try {
      const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.isAdmin = decoded.role === "admin";
      next();
    } catch (error) {
      return next(new Error("Invalid Token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User connected on socket id:", socket.id);

    // Each customer only receives their own conversation; admins get notified of all of them
    socket.join(`user:${socket.userId}`);
    if (socket.isAdmin) socket.join("admins");

    // Send chat history to the user
    const messages = await Chat.find({ userId: socket.userId }).sort({ timestamp: 1 });
    socket.emit("chatHistory", messages);

    socket.on("sendMessage", async (data) => {
      const text = typeof data?.message === "string" ? data.message.trim().slice(0, 2000) : "";
      if (!text) return;
      const newChat = new Chat({
        userId: socket.userId,
        sender: socket.userId, // User's ID
        receiver: "Admin", // Defaulting to Admin for now
        message: text,
      });

      await newChat.save();
      io.to(`user:${socket.userId}`).to("admins").emit("receiveMessage", newChat);

      // Notify admins of a new message
      io.to("admins").emit("newMessageNotification", { message: text, sender: socket.userId });

      // Push to the owner's phone
      const customer = await User.findById(socket.userId, "name").lean();
      notifyOwners({
        title: customer?.name || "New customer message",
        body: text,
        data: { type: "chat", userId: String(socket.userId), name: customer?.name || "" },
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
