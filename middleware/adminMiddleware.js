require("dotenv").config();
const User = require("../models/userModel");

// Must run after authMiddleware. Checks the role in the database, not just the token,
// so revoking someone's admin role takes effect immediately.
const adminMiddleware = async (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== "admin") return res.status(403).json({ error: "Access Denied" });
    req.admin = user;
    next();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = adminMiddleware;
