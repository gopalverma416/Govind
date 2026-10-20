// Matches the storefront's palette
export const colors = {
  bg: "#f5f5f7",
  card: "#ffffff",
  ink: "#1d1d1f",
  muted: "#6e6e73",
  line: "rgba(0,0,0,0.1)",
  brand: "#8a6a24",
  brandLight: "#e6b948",
  success: "#1a7f37",
  danger: "#d70015",
  live: "#34c759",
};

export const radius = { card: 18, field: 12, pill: 999 };

export const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

export const timeAgo = (iso) => {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export const titleCase = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);
