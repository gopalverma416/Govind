import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "./api";
import { useAuth } from "./auth";

const SocketContext = createContext({ connected: false, subscribe: () => () => {} });

/*
 * One live connection to the store's chat server while the owner is signed in.
 * Screens subscribe to "receiveMessage" events to update instantly.
 */
export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const [connected, setConnected] = useState(false);
  const [listeners] = useState(() => new Set()); // created once, never replaced

  useEffect(() => {
    if (!token) return undefined;
    const socket = io(API_BASE, { auth: { token: `Bearer ${token}` }, transports: ["websocket"] });
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("receiveMessage", (message) => listeners.forEach((listener) => listener(message)));
    return () => {
      socket.disconnect();
      setConnected(false);
    };
  }, [token, listeners]);

  const subscribe = useCallback((listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, [listeners]);

  const value = useMemo(() => ({ connected, subscribe }), [connected, subscribe]);
  return createElement(SocketContext.Provider, { value }, children);
};

export const useSocket = () => useContext(SocketContext);

// Calls handler for each live chat message while the component is mounted
export const useLiveMessages = (handler) => {
  const { subscribe } = useSocket();
  const saved = useRef(handler);
  useEffect(() => {
    saved.current = handler;
  });
  useEffect(() => subscribe((message) => saved.current(message)), [subscribe]);
};
