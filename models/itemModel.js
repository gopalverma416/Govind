const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true},
    images: { type: [String], required: true },
    description: { type: String, trim: true },
    category: { type: String, trim: true }, // Ensuring category is required
}, { timestamps: true }); // Adds createdAt and updatedAt fields automatically

module.exports = mongoose.model('Item', itemSchema);
