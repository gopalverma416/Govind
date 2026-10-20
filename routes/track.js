const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const PageView = require("../models/pageViewModel");

const router = express.Router();

const deviceFrom = (userAgent = "") => {
  if (/iPad|Tablet/i.test(userAgent)) return "tablet";
  if (/Mobi|Android|iPhone/i.test(userAgent)) return "mobile";
  return "desktop";
};

// Signed-in visitors send their token; anonymous visits are recorded without a user
const userIdFrom = (req) => {
  const header = req.header("Authorization") || "";
  if (!header.startsWith("Bearer ")) return undefined;
  try {
    return jwt.verify(header.slice(7), process.env.JWT_SECRET).userId;
  } catch {
    return undefined;
  }
};

// POST /api/track: record one storefront page view for the owner's dashboard
router.post("/", async (req, res) => {
  const { sessionId, path, referrer } = req.body || {};
  if (typeof sessionId !== "string" || sessionId.length > 64 || typeof path !== "string" || path.length > 300) {
    return res.status(400).json({ msg: "Invalid page view" });
  }
  if (path.startsWith("/admin")) return res.status(204).end();

  const productMatch = path.match(/^\/product\/([a-f0-9]{24})/i);
  try {
    await PageView.create({
      sessionId,
      path,
      userId: userIdFrom(req),
      productId: productMatch && mongoose.Types.ObjectId.isValid(productMatch[1]) ? productMatch[1] : undefined,
      referrer: typeof referrer === "string" ? referrer.slice(0, 300) : undefined,
      device: deviceFrom(req.header("User-Agent")),
    });
    res.status(204).end();
  } catch (err) {
    console.error("Error recording page view:", err.message);
    res.status(500).json({ msg: "Could not record page view" });
  }
});

module.exports = router;
