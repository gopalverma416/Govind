const authMiddleware = require("./authMiddleware");
const adminMiddleware = require("./adminMiddleware");

// Route guard: a valid token AND an admin role in the database
module.exports = [authMiddleware, adminMiddleware];
