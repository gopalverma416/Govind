// Local demo backend for trying the website and owner app without touching real data.
//   npm run demo
// Starts the real server on http://localhost:5099 with a throwaway in-memory database
// seeded with products, a week of visits, an order and customer chats.
// Owner sign-in: owner@govind.in / owner1234
const { spawn } = require("child_process");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const PORT = process.env.DEMO_PORT || 5099;
const ago = (minutes) => new Date(Date.now() - minutes * 60000);

// Real product photos from the live store when online, simple placeholders otherwise
const loadProducts = async () => {
  try {
    const res = await fetch("https://govind-jwellers.onrender.com/api/items", { signal: AbortSignal.timeout(20000) });
    const items = (await res.json()).filter((item) => !/hjdsg/i.test(item.name)).slice(0, 6);
    if (items.length) return items.map(({ _id, __v, ...rest }) => rest);
  } catch {
    // offline: fall through
  }
  return ["rings", "necklaces", "earrings", "bracelets"].map((category, i) => ({
    name: `Demo ${category.slice(0, -1)}`,
    price: 50000 * (i + 1),
    weight: 5 * (i + 1),
    category,
    images: [`https://placehold.co/600x600?text=${category}`],
  }));
};

(async () => {
  const mongo = await MongoMemoryServer.create();
  const uri = mongo.getUri("govinddemo");
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  const owner = (await db.collection("users").insertOne({ name: "Govind Verma", email: "owner@govind.in", password: await bcrypt.hash("owner1234", 12), age: 45, gender: "Male", address: "Shop", weight: 70, role: "admin" })).insertedId;
  const [priya, rahul] = Object.values(
    (
      await db.collection("users").insertMany([
        { name: "Priya Sharma", email: "priya@example.com", password: await bcrypt.hash("priya1234", 12), age: 28, gender: "Female", address: "Delhi", weight: 55, role: "user" },
        { name: "Rahul Mehta", email: "rahul@example.com", password: await bcrypt.hash("rahul1234", 12), age: 34, gender: "Male", address: "Jaipur", weight: 72, role: "user" },
      ])
    ).insertedIds
  );

  const products = (await loadProducts()).map((item, i) => ({ ...item, createdAt: ago(1440 * (6 - i)) }));
  const itemIds = Object.values((await db.collection("items").insertMany(products)).insertedIds);

  // A week of visits
  const views = [];
  for (let day = 6; day >= 0; day--) {
    for (let v = 0; v < 4 + ((day * 7) % 9); v++) {
      const at = ago(day * 1440 + 60 + v * 37);
      const productId = itemIds[v % itemIds.length];
      views.push({ sessionId: `d${day}v${v}`, path: "/", device: v % 3 ? "mobile" : "desktop", createdAt: at });
      views.push({ sessionId: `d${day}v${v}`, path: `/product/${productId}`, productId, device: v % 3 ? "mobile" : "desktop", createdAt: at });
    }
  }
  await db.collection("pageviews").insertMany(views);

  await db.collection("chats").insertMany([
    { userId: priya, sender: priya, receiver: "Admin", message: "Hi! Is this piece available in a lighter weight?", timestamp: ago(40), seenByOwner: true },
    { userId: priya, sender: owner, receiver: String(priya), message: "Yes, we can make it lighter. Shall I share a sketch?", timestamp: ago(35), seenByOwner: true },
    { userId: priya, sender: priya, receiver: "Admin", message: "Yes please! Also, can it be ready before Diwali?", timestamp: ago(2), seenByOwner: false },
    { userId: rahul, sender: rahul, receiver: "Admin", message: "Do you do engagement ring resizing?", timestamp: ago(180), seenByOwner: false },
  ]);
  await db.collection("payments").insertOne({ userId: rahul, firstName: "Rahul", lastName: "Mehta", gender: "Male", phone: "9876543210", address: { street: "12 MI Road", district: "Jaipur", pincode: "302001" }, paymentMethod: "Cash on Delivery", cart: [{ itemId: itemIds[0], quantity: 1 }], totalPrice: products[0].price, paymentDate: ago(300) });
  await mongoose.disconnect();

  // "Live" visitors keep arriving so the dashboard's "right now" panel has people in it
  const track = (body) => fetch(`http://localhost:${PORT}/api/track`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => {});
  const visitorTimer = setInterval(() => {
    track({ sessionId: "demo-live-1", path: `/product/${itemIds[1 % itemIds.length]}` });
    track({ sessionId: "demo-live-2", path: "/list" });
  }, 60000);

  const server = spawn(process.execPath, ["index.js"], {
    cwd: path.join(__dirname, ".."),
    stdio: "inherit",
    env: {
      ...process.env,
      MONGODB_URI: uri,
      JWT_SECRET: "demo-secret",
      PORT: String(PORT),
      EXTRA_CORS_ORIGINS: "http://localhost:8081",
    },
  });
  setTimeout(() => {
    track({ sessionId: "demo-live-1", path: `/product/${itemIds[1 % itemIds.length]}` });
    track({ sessionId: "demo-live-2", path: "/list" });
  }, 4000);

  console.log(`\nDemo backend: http://localhost:${PORT}`);
  console.log("Owner sign-in: owner@govind.in / owner1234");
  console.log("Customer sign-in (for the website chat): priya@example.com / priya1234\n");

  const stop = async () => {
    clearInterval(visitorTimer);
    server.kill();
    await mongo.stop();
    process.exit(0);
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
})().catch((err) => {
  console.error("Demo failed to start:", err);
  process.exit(1);
});
