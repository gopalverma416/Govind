import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { ArrowUp } from "lucide-react";
import { API_BASE } from "../lib/api";
import { getUserIdFromToken } from "../utils/auth";
import { BRAND } from "../content/site";
import PageMeta from "./site/PageMeta";
import { whatsappLink } from "./site/WhatsAppButton";

const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : "";

const Chat = () => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    if (!token) return undefined;
    const socket = io(API_BASE, { auth: { token: `Bearer ${token}` } });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("chatHistory", (history) => setMessages(history));
    socket.on("receiveMessage", (data) => setMessages((prev) => [...prev, data]));
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !socketRef.current) return;
    socketRef.current.emit("sendMessage", { message: message.trim() });
    setMessage("");
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-mist px-4 pb-16 pt-28 text-center">
        <PageMeta title="Talk to a Designer" />
        <h1 className="text-[32px] font-semibold text-ink md:text-[40px]">Talk to a designer.</h1>
        <p className="mx-auto mt-3 max-w-[480px] text-[17px] text-muted">Sign in to chat with our team about a piece, sizing or a bespoke design. Or message us on WhatsApp.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/login" state={{ from: location }} className="btn-filled">Sign in to chat</Link>
          <a href={whatsappLink(`Hi ${BRAND.name}, I'd like to talk to a designer.`)} target="_blank" rel="noopener noreferrer" className="btn-outline">WhatsApp us</a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col bg-mist pt-12">
      <PageMeta title="Talk to a Designer" />
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[760px] items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-[15px] font-semibold text-white">G</div>
          <div className="flex-1">
            <h1 className="text-[17px] font-semibold text-ink">Govind Designers</h1>
            <p className="flex items-center gap-1.5 text-[12px] text-muted">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-black/20"}`} />
              {connected ? "Connected" : "Connecting…"}
            </p>
          </div>
          <a href={BRAND.phoneHref} className="text-[14px] text-brand hover:underline">Call us</a>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ul className="mx-auto flex max-w-[760px] flex-col gap-2 px-4 py-6" aria-live="polite">
          {messages.length === 0 && (
            <li className="mx-auto my-10 max-w-[420px] text-center text-[14px] text-muted">
              Tell us what you’re looking for: an occasion, a budget or a sketch idea. A designer will reply here.
            </li>
          )}
          {messages.map((msg, index) => {
            const mine = String(msg.sender) === String(userId);
            return (
              <li key={msg._id || index} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-[20px] px-4 py-2.5 text-[17px] leading-[1.35] ${mine ? "rounded-br-md bg-brand text-white" : "rounded-bl-md bg-white text-ink shadow-sm"}`}>
                  <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                  <p className={`mt-0.5 text-[11px] ${mine ? "text-white/70" : "text-muted"}`}>{formatTime(msg.timestamp || msg.createdAt)}</p>
                </div>
              </li>
            );
          })}
          <li ref={endRef} aria-hidden="true" />
        </ul>
      </div>

      <form onSubmit={sendMessage} className="border-t border-black/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[760px] items-center gap-2 px-4 py-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message"
            aria-label="Message"
            className="flex-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-[17px] focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            aria-label="Send"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white transition-opacity disabled:opacity-30"
          >
            <ArrowUp size={20} />
          </button>
        </div>
      </form>
    </main>
  );
};

export default Chat;
