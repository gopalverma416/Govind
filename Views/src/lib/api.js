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

export const fetchCart = (userId) =>
  axios
    .get(`${API_BASE}/api/cart/${userId}`)
    .then((res) => res.data.items || [])
    .catch(() => []);

export const formatPrice = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const titleCase = (text = "") => text.charAt(0).toUpperCase() + text.slice(1);
