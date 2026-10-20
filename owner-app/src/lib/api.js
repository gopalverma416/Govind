import { Platform } from "react-native";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

// EXPO_PUBLIC_API_BASE lets you point the app at a local backend while testing
export const API_BASE = process.env.EXPO_PUBLIC_API_BASE || Constants.expoConfig?.extra?.apiBase || "https://govind-jwellers.onrender.com";

const TOKEN_KEY = "govind_owner_token";

// SecureStore (encrypted) on phones; browser storage only when previewing on the web
const storage =
  Platform.OS === "web"
    ? {
        getItemAsync: async (key) => globalThis.localStorage?.getItem(key) ?? null,
        setItemAsync: async (key, value) => globalThis.localStorage?.setItem(key, value),
        deleteItemAsync: async (key) => globalThis.localStorage?.removeItem(key),
      }
    : SecureStore;
let currentToken = null;
let onUnauthorized = () => {};

export const getToken = () => currentToken;
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

export const loadToken = async () => {
  currentToken = await storage.getItemAsync(TOKEN_KEY);
  return currentToken;
};
export const saveToken = async (token) => {
  currentToken = token;
  await storage.setItemAsync(TOKEN_KEY, token);
};
export const clearToken = async () => {
  currentToken = null;
  await storage.deleteItemAsync(TOKEN_KEY);
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/*
 * Calls the store API as the signed-in owner.
 * Pass `body` for JSON or `form` (FormData) for photo uploads.
 */
export const api = async (path, { method = "GET", body, form } = {}) => {
  const headers = { Accept: "application/json" };
  if (currentToken) headers.Authorization = `Bearer ${currentToken}`;
  if (body) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { method, headers, body: form || (body ? JSON.stringify(body) : undefined) });
  } catch {
    throw new ApiError("Can’t reach the store. Check your connection.", 0);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    // empty body (204)
  }
  if (res.status === 401) onUnauthorized();
  if (!res.ok) throw new ApiError(data?.msg || data?.message || data?.error || "Something went wrong", res.status);
  return data;
};

// FormData entry for a local image picked on the phone
export const imagePart = (asset, index) => ({
  uri: asset.uri,
  name: asset.fileName || `photo-${Date.now()}-${index}.jpg`,
  type: asset.mimeType || "image/jpeg",
});
