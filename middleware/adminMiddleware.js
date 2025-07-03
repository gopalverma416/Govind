require("dotenv").config();
const User = require("../models/userModel");



const adminMiddleware = async (req, res, next) => {
    console.log("adminMiddleware - req.user:", req.user); 

    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized access" });
      }
    try {
      const user = await User.findById(req.user.id);
      if (user.role !== "admin") return res.status(403).json({ error: "Access Denied" });
  
      next();
    } catch (err) {
       
      res.status(500).json({ error: "Server error" });
    }
  };

  module.exports = adminMiddleware;

