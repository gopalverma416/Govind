const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  district: { type: String, required: true },
  pincode: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('UserDetails', userDetailsSchema);
