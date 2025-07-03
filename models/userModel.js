const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, maxlength: 50 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  age: { type: Number, required:true},
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  weight: { type: Number,required:true},
  createdAt: { type: Date, default: Date.now }, // Keeps your original structure
});

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
