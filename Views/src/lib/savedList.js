import { useCallback, useSyncExternalStore } from "react";

/*
 * A small list of product snapshots persisted in localStorage and shared live between
 * components (and browser tabs). Used for the wishlist and recently viewed pieces.
 * Snapshots keep what a card needs to render without refetching: { _id, name, price, image, category }.
 */
const createSavedList = (storageKey, { max = 50 } = {}) => {
  const listeners = new Set();
  let cached = null;

  const read = () => {
    if (cached) return cached;
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      cached = Array.isArray(parsed) ? parsed : [];
    } catch {
      cached = [];
    }
    return cached;
  };

  const write = (list) => {
    cached = list.slice(0, max);
    try {
      localStorage.setItem(storageKey, JSON.stringify(cached));
    } catch {
      // storage full or blocked: keep the in-memory list for this session
    }
    listeners.forEach((listener) => listener());
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    const onStorage = (e) => {
      if (e.key !== storageKey) return;
      cached = null;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  };

  const snapshot = (item) => ({
    _id: item._id,
    name: item.name,
    price: item.price,
    image: item.image || item.images?.[0],
    category: item.category,
  });

  const store = {
    get: read,
    has: (id) => read().some((entry) => entry._id === id),
    add: (item) => write([snapshot(item), ...read().filter((entry) => entry._id !== item._id)]),
    remove: (id) => write(read().filter((entry) => entry._id !== id)),
    toggle: (item) => (store.has(item._id) ? store.remove(item._id) : store.add(item)),
    subscribe,
  };
  return store;
};

export const wishlist = createSavedList("govind:wishlist", { max: 100 });
export const recentlyViewed = createSavedList("govind:recently-viewed", { max: 12 });

export const useSavedList = (store) => useSyncExternalStore(store.subscribe, store.get, () => []);

export const useWishlist = () => {
  const items = useSavedList(wishlist);
  const isSaved = useCallback((id) => items.some((entry) => entry._id === id), [items]);
  return { items, isSaved, toggle: wishlist.toggle, remove: wishlist.remove };
};
