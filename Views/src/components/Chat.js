import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io("${process.env.REACT_APP_API_BASE}", {
  auth: { token: token ? `Bearer ${token}` : "" }, // Ensure token is provided
});

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  useEffect(() => {
    // Load chat history from backend
    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // Notify admin of new messages
    socket.on("newMessageNotification", () => {
      if (isAdmin) {
        setNewMessageAlert(true);
      }
    });

    // Receive messages in real-time
    socket.on("receiveMessage", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("chatHistory");
      socket.off("newMessageNotification");
      socket.off("receiveMessage");
    };
  }, [isAdmin]);

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("sendMessage", { message });
      setMessage("");
    }
  };

  return (
    <div className="max-w-sm mx-auto text-center p-4 border rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold">{isAdmin ? "Admin Panel" : "Chat with Us"}</h2>

      {newMessageAlert && isAdmin && <p className="text-red-500">New message received!</p>}

      <div className="h-72 overflow-y-scroll border p-2 my-2 rounded-md">
        {messages.map((msg, index) => (
          <p key={index} className="text-left">
            <strong>{msg.sender}:</strong> {msg.message}
          </p>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="w-4/5 p-2 border rounded-md"
        />
        <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
          Send
        </button>
      </div>

      <button onClick={() => setIsAdmin(!isAdmin)} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
        {isAdmin ? "Switch to Customer" : "Switch to Admin"}
      </button>
    </div>
  );
};

export default Chat;
