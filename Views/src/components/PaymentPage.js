import React, { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Banknote, CreditCard, Landmark, Smartphone } from "lucide-react";
import { API_BASE, cartItemsFrom, formatPrice } from "../lib/api";
import { getUserIdFromToken } from "../utils/auth";
import { Alert, Button, Card, Spinner } from "./site/ui";
import CheckoutSteps from "./site/CheckoutSteps";
import PageMeta from "./site/PageMeta";

const METHODS = [
  { value: "Cash on Delivery", icon: Banknote, detail: "Pay when your order arrives." },
  { value: "UPI", icon: Smartphone, detail: "Google Pay, PhonePe, Paytm or any UPI app." },
  { value: "Credit Card", icon: CreditCard, detail: "Visa, Mastercard, RuPay." },
  { value: "Debit Card", icon: CreditCard, detail: "Any Indian debit card." },
  { value: "Net Banking", icon: Landmark, detail: "All major Indian banks." },
];

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || getUserIdFromToken();
  const userDetails = location.state?.formData;

  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(METHODS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${API_BASE}/api/cart/${userId}`)
      .then((response) => setCart(cartItemsFrom(response.data)))
      .catch((err) => {
        console.error("Error fetching cart:", err);
        setCart([]);
      });
  }, [userId]);

  // Checkout needs delivery details from the previous step
  if (!userDetails) return <Navigate to="/user-details" replace state={{ userId }} />;

  const totalPrice = (cart || []).reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/api/payment`, { userId, ...userDetails, paymentMethod });
      if (response.status === 201) {
        navigate("/thank-you", { replace: true, state: { orderId: response.data.paymentId, paymentMethod, total: totalPrice } });
      }
    } catch (err) {
      console.error("Error placing order:", err);
      setError("We couldn’t place your order. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-mist px-4 pb-16 pt-24 md:pt-28">
      <PageMeta title="Review Your Order" />
      <div className="mx-auto max-w-[980px]">
        <CheckoutSteps current={2} />
        <h1 className="mb-10 text-center text-[32px] font-semibold leading-[1.125] text-ink md:text-[40px]">Review your order.</h1>

        <div className="grid gap-6 md:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <Card>
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-[21px] font-semibold text-ink">Delivery</h2>
                <Link to="/user-details" state={{ userId }} className="text-[14px] text-brand hover:underline">Edit</Link>
              </div>
              <p className="mt-3 text-[17px] text-ink">{userDetails.firstName} {userDetails.lastName}</p>
              <p className="text-[17px] text-ink/80">{userDetails.street}, {userDetails.district} {userDetails.pincode}</p>
              <p className="text-[17px] text-ink/80">{userDetails.phone}</p>
            </Card>

            <Card>
              <h2 className="text-[21px] font-semibold text-ink">How would you like to pay?</h2>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label="Payment method">
                {METHODS.map(({ value, icon: Icon, detail }) => {
                  const selected = paymentMethod === value;
                  return (
                    <label
                      key={value}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors ${selected ? "border-brand bg-brand/[0.04] ring-2 ring-brand/20" : "border-black/15 hover:border-black/30"}`}
                    >
                      <input type="radio" name="payment" value={value} checked={selected} onChange={() => setPaymentMethod(value)} className="sr-only" />
                      <Icon size={22} className={selected ? "text-brand" : "text-muted"} />
                      <span className="flex-1">
                        <span className="block text-[17px] font-semibold text-ink">{value}</span>
                        <span className="block text-[14px] text-muted">{detail}</span>
                      </span>
                      <span className={`h-5 w-5 rounded-full border-2 ${selected ? "border-[6px] border-brand" : "border-black/20"}`} aria-hidden="true" />
                    </label>
                  );
                })}
              </div>
              <Alert tone="info" className="mt-4">
                You won’t be charged online. Our team will call you on {userDetails.phone} to confirm your order and arrange payment.
              </Alert>
            </Card>
          </div>

          <div className="md:sticky md:top-20 md:self-start">
            <Card>
              <h2 className="text-[21px] font-semibold text-ink">Order summary</h2>
              {cart === null ? (
                <Spinner className="py-8" />
              ) : cart.length === 0 ? (
                <p className="mt-4 text-[17px] text-muted">Your bag is empty. <Link to="/list" className="text-brand hover:underline">Shop jewellery</Link></p>
              ) : (
                <>
                  <ul className="mt-4 space-y-4">
                    {cart.map((item) => (
                      <li key={item.itemId?._id || item.itemId} className="flex items-center gap-3">
                        <img src={item.image} alt="" className="h-14 w-14 rounded-lg bg-mist object-cover" />
                        <div className="flex-1">
                          <p className="text-[14px] font-semibold text-ink">{item.name}</p>
                          <p className="text-[12px] text-muted">Qty {item.quantity}</p>
                        </div>
                        <p className="text-[14px] tabular-nums text-ink">{formatPrice(item.price * item.quantity)}</p>
                      </li>
                    ))}
                  </ul>
                  <dl className="mt-5 space-y-2 border-t border-black/10 pt-4 text-[14px]">
                    <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatPrice(totalPrice)}</dd></div>
                    <div className="flex justify-between"><dt className="text-muted">Insured delivery</dt><dd>Free</dd></div>
                  </dl>
                  <div className="mt-3 flex justify-between border-t border-black/10 pt-3 text-[21px] font-semibold">
                    <span>Total</span>
                    <span className="tabular-nums">{formatPrice(totalPrice)}</span>
                  </div>
                </>
              )}
              <Alert className="mt-4">{error}</Alert>
              <Button onClick={handlePayment} loading={isLoading} loadingText="Placing order…" disabled={!cart?.length} className="mt-5 w-full">
                Place order
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PaymentPage;
