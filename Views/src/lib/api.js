import axios from "axios";

export const API_BASE = "https://govind-jwellers.onrender.com";

// One in-flight/settled request per URL, shared by the nav, home page and local nav
const cache = new Map();
const getCached = (path) => {
  if (!cache.has(path)) {
    const request = axios.get(`${API_BASE}${path}`).then((res) => res.data);
    request.catch(() => cache.delete(path));
    cache.set(path, request);
  }
  return cache.get(path);
};

export const fetchItems = () => getCached("/api/items").catch(() => []);
export const fetchSlides = () => getCached("/api/admin/slideshow").catch(() => []);
export const fetchSketches = () => getCached("/api/admin/sketch").catch(() => []);

// Falls back to deriving categories from items if the categories endpoint fails
export const fetchCategories = () =>
  getCached("/api/items/categories").catch(async () => {
    const items = await fetchItems();
    return [...new Set(items.map((item) => item.category).filter(Boolean))];
  });

// The cart API returns { cart: [...] } when it has items and { items: [] } when empty
export const cartItemsFrom = (data) => data?.cart || data?.items || [];

export const fetchCart = (userId) =>
  axios
    .get(`${API_BASE}/api/cart/${userId}`)
    .then((res) => cartItemsFrom(res.data))
    .catch(() => []);

export const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const titleCase = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);

const GRAMS_PER_TROY_OUNCE = 31.1034768;
const spotPerGram = (symbol) =>
  axios.get(`https://api.gold-api.com/price/${symbol}/INR`, { timeout: 8000 }).then(({ data }) => ({
    perGram: data.price / GRAMS_PER_TROY_OUNCE,
    updatedAt: data.updatedAt,
  }));

// Gold and silver rates in INR from our API, falling back to the spot provider
// directly if our backend is unreachable or not yet deployed with /api/rates
export const fetchMetalRates = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/rates`, { timeout: 8000 });
    if (data?.gold24kPer10g) return data;
  } catch {
    // fall through to the direct provider
  }
  const [gold, silver] = await Promise.all([spotPerGram("XAU"), spotPerGram("XAG")]);
  return {
    currency: "INR",
    gold24kPer10g: Math.round(gold.perGram * 10),
    gold22kPer10g: Math.round(gold.perGram * (22 / 24) * 10),
    silverPerKg: Math.round(silver.perGram * 1000),
    premiumPercent: 0,
    basis: "spot",
    updatedAt: [gold.updatedAt, silver.updatedAt].sort().pop(),
  };
};

// Anonymous per-browser id so the owner app can count unique and live visitors
const visitorSessionId = () => {
  try {
    let id = localStorage.getItem("govind:sid");
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem("govind:sid", id);
    }
    return id;
  } catch {
    return "no-storage";
  }
};

// Reports a page view for the owner's dashboard; never blocks or breaks the page
export const trackPageView = (path) => {
  const token = localStorage.getItem("token");
  axios
    .post(
      `${API_BASE}/api/track`,
      { sessionId: visitorSessionId(), path, referrer: document.referrer || undefined },
      { headers: token ? { Authorization: `Bearer ${token}` } : {} }
    )
    .catch(() => {});
};
