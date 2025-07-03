const express = require("express");
const cors = require("cors");
const http = require("http"); 
const path = require("path");
const admin=require("./routes/admin");
const initializeSocket = require("./socket");
const paymentRoutes = require("./routes/payments");
// const {uploadMultipleToCloudinary}=require("./cloudinaryConfig");
// const fs = require('fs');
const multiple=require("./routes/multiple");





// const { fullCloudinaryTest } = require('./cloudinaryTest');

const connectDB = require("./db");
require("dotenv").config();
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging line




const app = express();

// Connect to MongoDB
connectDB();
const server = http.createServer(app)
// Initialize Socket.io
initializeSocket(server);





// Middleware
app.use(cors({ origin: "*" })); // Allow all origins (configure as needed)
app.use(express.json()); // Parse JSON request body
const itemRoutes = require('./routes/items');
const  userDetailsRoutes= require('./routes/user');


app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// Routes

app.use('/api/items', itemRoutes);
app.use('/api/admin', admin);
app.use("/api/cart", require("./routes/cart"));

app.use("/api/users", require("./routes/users")); // Protected Users route
app.use("/api/auth", require("./routes/auth")); // Authentication route
app.use("/api/chat", require("./routes/chat"));
app.use("/api/user-details", userDetailsRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/multiple", multiple);

// fullCloudinaryTest();

// const possibleImagePaths = [
//     path.join(__dirname, 'test-image.jpg'),
//     path.join(__dirname, 'public', 'test-image.jpg'),
//     path.join(__dirname, 'uploads', 'vanshu.jpg')
//   ];

//    const filePaths = possibleImagePaths.filter(fs.existsSync);
// uploadMultipleToCloudinary(filePaths)
//   .then(urls => console.log("Uploaded URLs:", urls))
//   .catch(err => console.error("Upload failed:", err));


// Default Route
app.get("/", (req, res) => {
    console.log("Inside the home page route handler");
    res.send("Hello jee, this is Gopal Verma's homepage");
});

// Error Handling Middleware (for better debugging)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ msg: "Internal Server Error" });
});

// Start Server
const PORT = process.env.PORT || 5005;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
