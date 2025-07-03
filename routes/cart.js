const express = require("express");
const mongoose = require("mongoose"); // ✅ Import mongoose
const router = express.Router();
const Cart = require("../models/cartModel");


// 🛒 Add an item to the cart
router.post("/add", async (req, res) => {
  const { userId, itemId, name, price, image } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.itemId.toString() === itemId);

    if (existingItem) {
      existingItem.quantity += 1; // Increase quantity if already in cart
    } else {
      cart.items.push({ itemId, name, price, image, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).json({ message: "Error adding item to cart" });
  }
});

// 🛒 Get cart items for a user (Persistent even after logout)
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // ✅ Extract userId from params

    // ✅ Validate userId before querying MongoDB
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.itemId");

    // ✅ Check if the cart exists and has items
    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    res.json({ cart: cart.items });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// 🛒 Get total number of items in the cart
router.get("/count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({ count: 0 });
    }

    const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ count: totalCount });
  } catch (err) {
    console.error("Error fetching cart count:", err);
    res.status(500).json({ message: "Error fetching cart count" });
  }
});

// 🛒 Remove an item from the cart
router.delete("/remove/:userId/:itemId", async (req, res) => {
  const { userId, itemId } = req.params;
  console.log(userId);
  console.log(itemId);
  if (!mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({ message: "Invalid itemId" });
  }
  
  try {
    const cart = await Cart.findOne({ userId });
    
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    const itemIndex = cart.items.findIndex((item) => item.itemId.equals(new mongoose.Types.ObjectId(itemId)));
    console.log(itemIndex);
    console.log("Received itemId:", itemId, typeof itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    cart.items.splice(itemIndex, 1); // Remove the item using splice
    await cart.save();

    res.status(200).json({ message: "Item removed", cart });
    
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ message: "Error removing item from cart" });
  }
});

// 🛒 Clear the cart (e.g., after checkout)
router.post("/clear", async (req, res) => {
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = []; // Empty the cart
    await cart.save();

    res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;
