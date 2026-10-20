const PushToken = require("../models/pushTokenModel");

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

// Sends a push notification to every registered owner device through Expo's push service.
// Failures are logged, never thrown, so a notification problem can't break chat.
const notifyOwners = async ({ title, body, data }) => {
  try {
    const tokens = await PushToken.find().lean();
    if (tokens.length === 0) return;
    const messages = tokens.map(({ token }) => ({ to: token, title, body, data, sound: "default", channelId: "messages", priority: "high" }));
    const res = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(messages),
      signal: AbortSignal.timeout(10000),
    });
    const result = await res.json();
    // Forget tokens for devices that uninstalled the app
    const stale = (result.data || [])
      .map((ticket, i) => (ticket.details?.error === "DeviceNotRegistered" ? tokens[i].token : null))
      .filter(Boolean);
    if (stale.length) await PushToken.deleteMany({ token: { $in: stale } });
  } catch (err) {
    console.error("Push notification failed:", err.message);
  }
};

module.exports = { notifyOwners };
