import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Package, ShieldCheck, Truck } from "lucide-react";
import { PROMISES } from "../content/site";
import { API_BASE, cartItemsFrom, formatPrice } from "../lib/api";
import { getUserIdFromToken } from "../utils/auth";
import { Button, Spinner } from "./site/ui";
import PageMeta from "./site/PageMeta";
import Footbar from "./Footbar";

const Purchase = () => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removing, setRemoving] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }
    axios
      .get(`${API_BASE}/api/cart/${userId}`)
      .then((response) => setCartItems(cartItemsFrom(response.data)))
      .catch((error) => console.error("Error fetching cart:", error))
      .finally(() => setIsLoading(false));
  }, [userId, navigate, location]);

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleRemoveItem = async (item) => {
    const itemId = item.itemId?._id || item.itemId;
    setRemoving(itemId);
    try {
      await axios.delete(`${API_BASE}/api/cart/remove/${userId}/${itemId}`);
      const response = await axios.get(`${API_BASE}/api/cart/${userId}`);
      setCartItems(cartItemsFrom(response.data));
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setRemoving(null);
    }
  };

  const checkout = () => navigate("/user-details", { state: { userId } });

  const benefits = [
    { icon: Truck, ...PROMISES.delivery },
    { icon: ShieldCheck, ...PROMISES.hallmark },
    { icon: Package, ...PROMISES.exchange },
  ];

  return (
    <main className="min-h-screen bg-white pt-12">
      <PageMeta title="Bag" />
      <div className="mx-auto max-w-content px-6 pb-16 pt-12 md:px-[22px] md:pt-16">
        {isLoading ? (
          <Spinner />
        ) : cartItems.length === 0 ? (
          <div className="py-12 text-center">
            <h1 className="headline-tile">Your bag is empty.</h1>
            <p className="mt-3 text-[17px] text-muted">Find something you love, or pick up where you left off in your wishlist.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/list" className="btn-filled">Shop jewellery</Link>
              <Link to="/wishlist" className="btn-outline">View wishlist</Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-6 border-b border-black/10 pb-8 text-center md:text-left">
              <h1 className="headline-tile">Your bag total is {formatPrice(totalPrice)}.</h1>
              <p className="text-[17px] text-muted">{PROMISES.delivery.title} {PROMISES.delivery.detail.toLowerCase()}</p>
              <div>
                <Button onClick={checkout} className="w-full px-10 md:w-auto">Check out</Button>
              </div>
            </div>

            <ul>
              {cartItems.map((item) => {
                const itemId = item.itemId?._id || item.itemId;
                return (
                  <li key={itemId} className="flex gap-5 border-b border-black/10 py-8 md:gap-10">
                    <Link to={`/product/${itemId}`} className="h-28 w-28 shrink-0 overflow-hidden rounded-[14px] bg-mist md:h-40 md:w-40">
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    </Link>
                    <div className="flex flex-1 flex-col gap-3 md:flex-row md:justify-between">
                      <div>
                        <Link to={`/product/${itemId}`} className="text-[21px] font-semibold text-ink hover:text-brand md:text-[24px]">{item.name}</Link>
                        <p className="mt-1 text-[14px] text-muted">Quantity {item.quantity} · {formatPrice(item.price)} each</p>
                      </div>
                      <div className="flex items-start justify-between gap-6 md:flex-col md:items-end">
                        <p className="text-[21px] font-semibold tabular-nums text-ink md:text-[24px]">{formatPrice(item.price * item.quantity)}</p>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item)}
                          disabled={removing === itemId}
                          className="text-[17px] text-brand hover:underline disabled:opacity-50"
                        >
                          {removing === itemId ? "Removing…" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="ml-auto max-w-[480px] pt-8">
              <dl className="space-y-2 text-[17px]">
                <div className="flex justify-between">
                  <dt className="text-ink/80">Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</dt>
                  <dd className="tabular-nums">{formatPrice(totalPrice)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink/80">Insured delivery</dt>
                  <dd>Free</dd>
                </div>
              </dl>
              <div className="mt-4 flex justify-between border-t border-black/10 pt-4 text-[24px] font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{formatPrice(totalPrice)}</span>
              </div>
              <Button onClick={checkout} className="mt-6 w-full">Check out</Button>
            </div>

            <ul className="mt-14 grid gap-6 rounded-[18px] bg-mist p-8 md:grid-cols-3">
              {benefits.map(({ icon: Icon, title, detail }) => (
                <li key={title} className="flex gap-3">
                  <Icon size={22} className="shrink-0 text-brand" />
                  <div>
                    <p className="text-[17px] font-semibold text-ink">{title}</p>
                    <p className="text-[14px] text-muted">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Footbar />
    </main>
  );
};

export default Purchase;
