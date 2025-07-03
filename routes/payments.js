const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Cart = require("../models/cartModel");
const Payment = require("../models/payment"); // Create Payment Model

// ✅ Payment API - Save Payment Details
router.post("/", async (req, res) => {
  try {
    const { userId, firstName, lastName, gender, phone, street, district, pincode, paymentMethod } = req.body;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Fetch Cart Details
    const cart = await Cart.findOne({ userId }).populate("items.itemId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const totalPrice = cart.items.reduce((sum, item) => sum + item.itemId.price * item.quantity, 0);

    // Create Payment Data
    const newPayment = new Payment({
      userId,
      firstName,
      lastName,
      gender,
      phone,
      address: { street, district, pincode },
      paymentMethod,
      cart: cart.items,
      totalPrice,
    });

    await newPayment.save();

    res.status(201).json({ message: "Payment Successful", paymentId: newPayment._id });
  } catch (err) {
    console.error("Error processing payment:", err);
    res.status(500).json({ message: "Error processing payment" });
  }
});

module.exports = router;
