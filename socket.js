const { Server } = require("socket.io");
const Chat = require("./models/chatModel");
const jwt = require("jsonwebtoken");

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
      next();
    } catch (error) {
      return next(new Error("Invalid Token"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("User connected on socket id:", socket.id);

    // Send chat history to the user
    const messages = await Chat.find({ userId: socket.userId }).sort({ timestamp: 1 });
    socket.emit("chatHistory", messages);

    socket.on("sendMessage", async (data) => {
      const newChat = new Chat({
        userId: socket.userId,
        sender: socket.userId, // User's ID
        receiver: "Admin", // Defaulting to Admin for now
        message: data.message,
      });

      await newChat.save();
      io.emit("receiveMessage", newChat);

      // Notify admin of a new message
      io.emit("newMessageNotification", { message: data.message, sender: socket.userId });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initializeSocket;
