const jwt = require("jsonwebtoken");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
 
  
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Access Denied. No Token Provided." });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET || "default_secret");
    console.log("Decoded Token:", decoded); 
    
    req.user = { id: decoded.userId };// Attach user ID to request object
    
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token" });
  }
}; 


module.exports = authMiddleware ;
