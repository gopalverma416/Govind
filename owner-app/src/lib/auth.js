import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearToken, loadToken, saveToken, setUnauthorizedHandler } from "./api";
import { registerForPush } from "./notifications";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState(null);
  const [pushToken, setPushToken] = useState(null);

  // Register this phone for chat notifications whenever the owner is signed in
  const enablePush = useCallback(async () => {
    const expoToken = await registerForPush();
    if (!expoToken) return;
    try {
      await api("/api/owner/push-token", { method: "POST", body: { token: expoToken } });
      setPushToken(expoToken);
    } catch (err) {
      console.warn("Could not save push token:", err.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (pushToken) {
      await api("/api/owner/push-token", { method: "DELETE", body: { token: pushToken } }).catch(() => {});
    }
    await clearToken();
    setPushToken(null);
    setToken(null);
  }, [pushToken]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setToken(null);
    });
    loadToken().then((saved) => {
      setToken(saved);
      setReady(true);
      if (saved) enablePush();
    });
  }, [enablePush]);

  const signIn = useCallback(
    async (email, password) => {
      const { token: newToken } = await api("/api/auth/owner-login", { method: "POST", body: { email: email.trim(), password } });
      await saveToken(newToken);
      setToken(newToken);
      enablePush();
    },
    [enablePush]
  );

  const value = useMemo(() => ({ ready, token, signIn, signOut, pushEnabled: Boolean(pushToken) }), [ready, token, signIn, signOut, pushToken]);
  return createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => useContext(AuthContext);
