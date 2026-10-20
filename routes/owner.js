const express = require("express");
const mongoose = require("mongoose");
const requireAdmin = require("../middleware/requireAdmin");
const { upload, uploadToCloudinary } = require("../cloudinaryConfig");
const Item = require("../models/itemModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Payment = require("../models/payment");
const PageView = require("../models/pageViewModel");
const PushToken = require("../models/pushTokenModel");

// Everything the owner app needs. Every route here requires an admin account.
const router = express.Router();
router.use(requireAdmin);

const TZ = "Asia/Kolkata";
const LIVE_WINDOW_MS = 5 * 60 * 1000;
const isId = (id) => mongoose.Types.ObjectId.isValid(id);

const startOfTodayIST = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: TZ }));
  const offset = now.getTime() - ist.getTime();
  ist.setHours(0, 0, 0, 0);
  return new Date(ist.getTime() + offset);
};

// ---------- Analytics ----------

// GET /api/owner/analytics?days=7
router.get("/analytics", async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 7, 1), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const today = startOfTodayIST();
    const liveSince = new Date(Date.now() - LIVE_WINDOW_MS);

    const [liveSessions, todayStats, series, topPages, topProducts, recentCustomers, totals] = await Promise.all([
      // Visitors active in the last five minutes, with the page they're on now
      PageView.aggregate([
        { $match: { createdAt: { $gte: liveSince } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$sessionId", path: { $first: "$path" }, userId: { $first: "$userId" }, device: { $first: "$device" }, lastSeen: { $first: "$createdAt" }, views: { $sum: 1 } } },
        { $sort: { lastSeen: -1 } },
        { $limit: 50 },
        { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user", pipeline: [{ $project: { name: 1, email: 1 } }] } },
        { $project: { _id: 0, sessionId: "$_id", path: 1, device: 1, lastSeen: 1, views: 1, user: { $first: "$user" } } },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, views: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
        { $project: { _id: 0, views: 1, visitors: { $size: "$sessions" } } },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } }, views: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
        { $project: { _id: 0, date: "$_id", views: 1, visitors: { $size: "$sessions" } } },
        { $sort: { date: 1 } },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: "$path", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
        { $project: { _id: 0, path: "$_id", views: 1 } },
      ]),
      PageView.aggregate([
        { $match: { createdAt: { $gte: since }, productId: { $exists: true } } },
        { $group: { _id: "$productId", views: { $sum: 1 }, sessions: { $addToSet: "$sessionId" } } },
        { $sort: { views: -1 } },
        { $limit: 8 },
        { $lookup: { from: "items", localField: "_id", foreignField: "_id", as: "item", pipeline: [{ $project: { name: 1, price: 1, images: { $slice: ["$images", 1] } } }] } },
        { $project: { _id: 0, productId: "$_id", views: 1, visitors: { $size: "$sessions" }, item: { $first: "$item" } } },
      ]),
      // Signed-in customers seen recently
      PageView.aggregate([
        { $match: { createdAt: { $gte: since }, userId: { $exists: true } } },
        { $sort: { createdAt: -1 } },
        { $group: { _id: "$userId", lastSeen: { $first: "$createdAt" }, lastPath: { $first: "$path" }, views: { $sum: 1 } } },
        { $sort: { lastSeen: -1 } },
        { $limit: 20 },
        { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user", pipeline: [{ $project: { name: 1, email: 1 } }] } },
        { $project: { _id: 0, userId: "$_id", lastSeen: 1, lastPath: 1, views: 1, user: { $first: "$user" } } },
      ]),
      Promise.all([
        Item.countDocuments(),
        User.countDocuments({ role: { $ne: "admin" } }),
        Payment.aggregate([{ $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } }]),
        Chat.countDocuments({ seenByOwner: false, receiver: "Admin" }),
      ]),
    ]);

    const [products, customers, orderStats, unreadMessages] = totals;
    res.json({
      live: { count: liveSessions.length, sessions: liveSessions },
      today: todayStats[0] || { views: 0, visitors: 0 },
      series,
      topPages,
      topProducts,
      recentCustomers,
      totals: { products, customers, orders: orderStats[0]?.orders || 0, revenue: orderStats[0]?.revenue || 0, unreadMessages },
    });
  } catch (err) {
    console.error("Owner analytics error:", err);
    res.status(500).json({ msg: "Could not load analytics" });
  }
});

// ---------- Orders ----------

// GET /api/owner/orders
router.get("/orders", async (req, res) => {
  try {
    const orders = await Payment.find()
      .sort({ paymentDate: -1 })
      .limit(200)
      .populate("cart.itemId", "name price images")
      .lean();
    res.json(orders);
  } catch (err) {
    console.error("Owner orders error:", err);
    res.status(500).json({ msg: "Could not load orders" });
  }
});

// ---------- Products ----------

const parseItemFields = (body) => {
  const fields = {};
  if (body.name !== undefined) fields.name = String(body.name).trim();
  if (body.description !== undefined) fields.description = String(body.description).trim();
  if (body.category !== undefined) fields.category = String(body.category).trim().toLowerCase();
  if (body.price !== undefined) fields.price = Number(body.price);
  if (body.weight !== undefined) fields.weight = Number(body.weight);
  return fields;
};

const validateItem = (fields, { partial = false } = {}) => {
  if (!partial || "name" in fields) if (!fields.name) return "Name is required";
  if (!partial || "price" in fields) if (!(fields.price >= 0)) return "Price must be a number";
  if (!partial || "weight" in fields) if (!(fields.weight > 0)) return "Weight must be a number";
  return null;
};

const uploadAll = (files = []) => Promise.all(files.map((file) => uploadToCloudinary(file.path)));

// POST /api/owner/items (multipart: images[] up to 6, name, price, weight, category, description)
router.post("/items", upload.array("images", 6), async (req, res) => {
  try {
    const fields = parseItemFields(req.body);
    const error = validateItem(fields);
    if (error) return res.status(400).json({ msg: error });
    if (!req.files?.length) return res.status(400).json({ msg: "Add at least one photo" });
    const images = await uploadAll(req.files);
    const item = await Item.create({ ...fields, images });
    res.status(201).json(item);
  } catch (err) {
    console.error("Owner create item error:", err);
    res.status(500).json({ msg: "Could not add the product" });
  }
});

// PUT /api/owner/items/:id (multipart; keepImages = JSON array of existing URLs to keep, new images[] appended)
router.put("/items/:id", upload.array("images", 6), async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ msg: "Invalid product" });
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Product not found" });

    const fields = parseItemFields(req.body);
    const error = validateItem(fields, { partial: true });
    if (error) return res.status(400).json({ msg: error });

    let keep = item.images;
    if (req.body.keepImages !== undefined) {
      const requested = JSON.parse(req.body.keepImages);
      keep = item.images.filter((url) => requested.includes(url));
    }
    const added = await uploadAll(req.files);
    const images = [...keep, ...added];
    if (images.length === 0) return res.status(400).json({ msg: "A product needs at least one photo" });

    Object.assign(item, fields, { images });
    await item.save();
    res.json(item);
  } catch (err) {
    console.error("Owner update item error:", err);
    res.status(500).json({ msg: "Could not update the product" });
  }
});

// DELETE /api/owner/items/:id
router.delete("/items/:id", async (req, res) => {
  if (!isId(req.params.id)) return res.status(400).json({ msg: "Invalid product" });
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "Product not found" });
    res.json({ msg: "Product deleted" });
  } catch (err) {
    console.error("Owner delete item error:", err);
    res.status(500).json({ msg: "Could not delete the product" });
  }
});

// ---------- Conversations ----------

// GET /api/owner/conversations: one row per customer, newest first, with unread counts
router.get("/conversations", async (req, res) => {
  try {
    const conversations = await Chat.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$userId",
          lastMessage: { $first: "$message" },
          lastAt: { $first: "$timestamp" },
          lastFromOwner: { $first: { $ne: ["$receiver", "Admin"] } },
          unread: { $sum: { $cond: [{ $and: [{ $eq: ["$receiver", "Admin"] }, { $ne: ["$seenByOwner", true] }] }, 1, 0] } },
        },
      },
      { $sort: { lastAt: -1 } },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user", pipeline: [{ $project: { name: 1, email: 1 } }] } },
      { $project: { _id: 0, userId: "$_id", lastMessage: 1, lastAt: 1, lastFromOwner: 1, unread: 1, user: { $first: "$user" } } },
    ]);
    res.json(conversations);
  } catch (err) {
    console.error("Owner conversations error:", err);
    res.status(500).json({ msg: "Could not load conversations" });
  }
});

// GET /api/owner/conversations/:userId: full thread; marks the customer's messages as read
router.get("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!isId(userId)) return res.status(400).json({ msg: "Invalid customer" });
  try {
    const [user, messages] = await Promise.all([
      User.findById(userId, "name email").lean(),
      Chat.find({ userId }).sort({ timestamp: 1 }).lean(),
    ]);
    await Chat.updateMany({ userId, receiver: "Admin", seenByOwner: { $ne: true } }, { seenByOwner: true });
    res.json({ user, messages });
  } catch (err) {
    console.error("Owner thread error:", err);
    res.status(500).json({ msg: "Could not load the conversation" });
  }
});

// POST /api/owner/conversations/:userId { message }: reply as the store
router.post("/conversations/:userId", async (req, res) => {
  const { userId } = req.params;
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!isId(userId)) return res.status(400).json({ msg: "Invalid customer" });
  if (!message || message.length > 2000) return res.status(400).json({ msg: "Write a message of up to 2000 characters" });
  try {
    const reply = await Chat.create({ userId, sender: req.admin._id, receiver: String(userId), message, seenByOwner: true });
    // Deliver live to the customer's open chat and to other owner devices
    req.app.get("io")?.to(`user:${userId}`).to("admins").emit("receiveMessage", reply);
    res.status(201).json(reply);
  } catch (err) {
    console.error("Owner reply error:", err);
    res.status(500).json({ msg: "Could not send the reply" });
  }
});

// ---------- Push notifications ----------

// POST /api/owner/push-token { token }: register this device for chat notifications
router.post("/push-token", async (req, res) => {
  const token = req.body?.token;
  if (typeof token !== "string" || !/^Expo(nent)?PushToken\[.+\]$/.test(token)) {
    return res.status(400).json({ msg: "Invalid push token" });
  }
  await PushToken.findOneAndUpdate({ token }, { token, userId: req.admin._id, updatedAt: new Date() }, { upsert: true });
  res.status(204).end();
});

// DELETE /api/owner/push-token { token }: stop notifications on this device (sign out)
router.delete("/push-token", async (req, res) => {
  if (typeof req.body?.token === "string") await PushToken.deleteOne({ token: req.body.token });
  res.status(204).end();
});

module.exports = router;
