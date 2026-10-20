// Promote an existing account to admin (owner) from the command line:
//   node scripts/make-admin.js owner@example.com
// Needs MONGODB_URI in .env. The account must already exist (sign up on the website first).
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/userModel");

(async () => {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/make-admin.js <email>");
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  // Emails are stored as typed at sign-up, so match without regard to case
  const pattern = new RegExp(`^${email.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  const user = await User.findOneAndUpdate({ email: pattern }, { role: "admin" }, { new: true });
  console.log(user ? `${user.email} is now an admin.` : `No account found for ${email}. Sign up on the website first.`);
  await mongoose.disconnect();
  process.exit(user ? 0 : 1);
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
