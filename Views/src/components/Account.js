import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { ChevronRight, Heart, MessageCircle, ShoppingBag } from "lucide-react";
import { getUserIdFromToken } from "../utils/auth";
import { API_BASE } from "../lib/api";
import { useWishlist } from "../lib/savedList";
import { Card, Spinner } from "./site/ui";
import PageMeta from "./site/PageMeta";
import Footbar from "./Footbar";

const Row = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-black/10 py-3.5 last:border-b-0 sm:flex-row sm:justify-between sm:gap-6">
    <dt className="text-[14px] text-muted">{label}</dt>
    <dd className="text-[17px] text-ink sm:text-right">{value || "—"}</dd>
  </div>
);

const Account = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();
  const { items: saved } = useWishlist();

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }
    axios
      .get(`${API_BASE}/api/users/${userId}`)
      .then((response) => setUser(response.data.user))
      .catch((error) => console.error("Error fetching user details:", error))
      .finally(() => setLoading(false));
  }, [userId, navigate, location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const shortcuts = [
    { to: "/purchase", icon: ShoppingBag, title: "Bag", detail: "Review your pieces and check out." },
    { to: "/wishlist", icon: Heart, title: "Wishlist", detail: saved.length ? `${saved.length} saved ${saved.length === 1 ? "piece" : "pieces"}.` : "Pieces you’ve saved for later." },
    { to: "/chat", icon: MessageCircle, title: "Talk to a designer", detail: "Questions, sizing or a bespoke idea." },
  ];

  return (
    <main className="min-h-screen bg-mist pt-12">
      <PageMeta title="Your Account" />
      <div className="mx-auto max-w-content px-6 pb-16 pt-12 md:px-[22px] md:pt-16">
        {loading ? (
          <Spinner />
        ) : (
          <>
            <p className="text-[17px] font-semibold text-brand">Govind Account</p>
            <h1 className="headline-tile mt-1">{user ? `Hi, ${user.name.split(" ")[0]}.` : "Your account."}</h1>

            <ul className="mt-8 grid gap-3 md:grid-cols-3">
              {shortcuts.map(({ to, icon: Icon, title, detail }) => (
                <li key={to}>
                  <Link to={to} className="group flex h-full items-center gap-4 rounded-[18px] bg-white p-5 shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.1)]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-mist text-brand">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[17px] font-semibold text-ink">{title}</span>
                      <span className="block text-[14px] text-muted">{detail}</span>
                    </span>
                    <ChevronRight size={18} className="text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              ))}
            </ul>

            {user ? (
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <Card>
                  <h2 className="text-[21px] font-semibold text-ink">Personal information</h2>
                  <dl className="mt-3">
                    <Row label="Name" value={user.name} />
                    <Row label="Email" value={user.email} />
                    <Row label="Age" value={user.age ? `${user.age}` : null} />
                    <Row label="Gender" value={user.gender} />
                  </dl>
                </Card>
                <Card>
                  <h2 className="text-[21px] font-semibold text-ink">Delivery address</h2>
                  <p className="mt-4 whitespace-pre-line text-[17px] text-ink">{user.address || "No address saved yet."}</p>
                  <p className="mt-6 text-[14px] text-muted">
                    Need to change your details? <Link to="/chat" className="text-brand hover:underline">Talk to us</Link> and we’ll update them for you.
                  </p>
                </Card>
              </div>
            ) : (
              <Card className="mt-6">
                <p className="text-[17px] text-muted">We couldn’t load your details right now. Please try again in a moment.</p>
              </Card>
            )}

            <button type="button" onClick={handleLogout} className="mt-8 text-[17px] text-brand hover:underline">
              Sign out
            </button>
          </>
        )}
      </div>
      <Footbar />
    </main>
  );
};

export default Account;
