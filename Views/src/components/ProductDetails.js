import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Check, Minus, Plus, Share2, ShieldCheck, Truck } from "lucide-react";
import { getUserIdFromToken } from "../utils/auth";
import { API_BASE, formatPrice, titleCase } from "../lib/api";
import { BRAND, PRODUCT_HIGHLIGHTS, PROMISES } from "../content/site";
import { recentlyViewed } from "../lib/savedList";
import WishlistButton from "./site/WishlistButton";
import RecentlyViewed from "./site/RecentlyViewed";
import PageMeta from "./site/PageMeta";
import { whatsappLink } from "./site/WhatsAppButton";
import { Alert, Button, Spinner } from "./site/ui";
import Footbar from "./Footbar";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = getUserIdFromToken();
  const [item, setItem] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [busy, setBusy] = useState(null);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setItem(null);
    setNotFound(false);
    setActiveImage(0);
    setQuantity(1);
    axios
      .get(`${API_BASE}/api/items/${id}`)
      .then((response) => setItem(response.data))
      .catch((error) => {
        console.error("Error fetching product details:", error);
        setNotFound(true);
      });
  }, [id]);

  // Remember this piece for the "Recently viewed" rows
  useEffect(() => {
    if (item?._id) recentlyViewed.add(item);
  }, [item]);

  if (notFound) {
    return (
      <main className="min-h-screen bg-white px-6 pt-32 text-center">
        <h1 className="headline-tile">We can’t find that piece.</h1>
        <p className="mt-3 text-[17px] text-muted">It may have sold out or moved. Explore the rest of the collection.</p>
        <Link to="/list" className="btn-filled mt-8">Shop jewellery</Link>
      </main>
    );
  }

  if (!item) return <Spinner className="min-h-screen items-center" />;

  const productUrl = `${BRAND.siteUrl}/product/${item._id}`;
  const images = item.images?.length ? item.images : [];

  const addToBag = async () => {
    if (!userId) {
      navigate("/login", { state: { from: location } });
      return false;
    }
    await axios.post(`${API_BASE}/api/cart/add`, {
      userId,
      itemId: item._id,
      name: item.name,
      price: item.price,
      image: images[0],
      quantity,
    });
    return true;
  };

  const handleAdd = async () => {
    setBusy("add");
    setNotice(null);
    try {
      if (await addToBag()) setNotice({ tone: "success", text: "Added to your bag." });
    } catch (error) {
      console.error("Error adding item to bag:", error);
      setNotice({ tone: "error", text: "We couldn’t add this to your bag. Please try again." });
    } finally {
      setBusy(null);
    }
  };

  // Buy adds this piece to the bag, then goes straight to checkout
  const handleBuy = async () => {
    setBusy("buy");
    setNotice(null);
    try {
      if (await addToBag()) navigate("/user-details", { state: { userId } });
    } catch (error) {
      console.error("Error starting checkout:", error);
      setNotice({ tone: "error", text: "We couldn’t start checkout. Please try again." });
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    const data = { title: item.name, text: `${item.name} from ${BRAND.name}`, url: productUrl };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(productUrl);
        setNotice({ tone: "success", text: "Link copied." });
      }
    } catch {
      // share sheet dismissed
    }
  };

  const specs = [
    item.weight ? { label: "Weight", value: `${item.weight} g` } : null,
    item.category ? { label: "Collection", value: titleCase(item.category) } : null,
    item.material ? { label: "Material", value: item.material } : null,
  ].filter(Boolean);

  return (
    <main className="bg-white pt-12">
      <PageMeta
        title={item.name}
        description={item.description || `${item.name}${item.category ? `, ${titleCase(item.category)}` : ""}, handcrafted by Govind Jewellers. ${formatPrice(item.price)}.`}
        image={images[0]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: item.name,
          image: images,
          description: item.description || undefined,
          category: item.category || undefined,
          sku: item._id,
          brand: { "@type": "Brand", name: BRAND.name },
          ...(item.weight ? { weight: { "@type": "QuantitativeValue", value: item.weight, unitCode: "GRM" } } : {}),
          offers: { "@type": "Offer", url: productUrl, priceCurrency: "INR", price: item.price },
        }}
      />

      <nav aria-label="Breadcrumb" className="mx-auto max-w-[1180px] px-6 pt-6 text-[12px] text-muted md:px-[22px]">
        <Link to="/list" className="hover:text-brand">Jewellery</Link>
        {item.category && (
          <>
            <span className="mx-1.5">›</span>
            <Link to={`/list?category=${encodeURIComponent(item.category)}`} className="hover:text-brand">{titleCase(item.category)}</Link>
          </>
        )}
      </nav>

      <div className="mx-auto grid max-w-[1180px] gap-10 px-6 pb-16 pt-6 md:grid-cols-[1.15fr_1fr] md:gap-16 md:px-[22px]">
        {/* Gallery */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[24px] bg-mist">
            {images.map((src, i) => (
              <img
                key={src}
                src={src}
                alt={i === activeImage ? item.name : ""}
                aria-hidden={i !== activeImage}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${i === activeImage ? "opacity-100" : "opacity-0"}`}
              />
            ))}
            <div className="absolute right-4 top-4 flex gap-2">
              <button type="button" onClick={handleShare} aria-label="Share this piece" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink/70 shadow-md transition-transform hover:scale-110">
                <Share2 size={18} />
              </button>
              <WishlistButton item={item} size={18} className="h-11 w-11" />
            </div>
          </div>
          {images.length > 1 && (
            <div className="mt-4 flex gap-3">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === activeImage}
                  className={`h-20 w-20 overflow-hidden rounded-[12px] bg-mist ring-offset-2 transition ${i === activeImage ? "ring-2 ring-brand" : "opacity-70 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          {item.category && <p className="text-[14px] font-semibold text-brand">{titleCase(item.category)}</p>}
          <h1 className="mt-1 text-[32px] font-semibold leading-[1.125] text-ink md:text-[48px] md:leading-[1.08]">{item.name}</h1>
          <p className="mt-3 text-[24px] tabular-nums text-ink">{formatPrice(item.price)}</p>
          {item.description && <p className="mt-5 text-[17px] leading-[1.47] text-ink/80">{item.description}</p>}

          {specs.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {specs.map((spec) => (
                <div key={spec.label} className="rounded-[14px] bg-mist px-4 py-3">
                  <dt className="text-[12px] text-muted">{spec.label}</dt>
                  <dd className="text-[17px] font-semibold text-ink">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 flex items-center gap-4">
            <span className="text-[14px] text-ink/80">Quantity</span>
            <div className="flex items-center rounded-full border border-black/15">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" className="flex h-10 w-10 items-center justify-center text-ink/70 hover:text-ink disabled:opacity-30" disabled={quantity <= 1}>
                <Minus size={16} />
              </button>
              <span className="w-8 text-center text-[17px] tabular-nums" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)} aria-label="Increase quantity" className="flex h-10 w-10 items-center justify-center text-ink/70 hover:text-ink">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button onClick={handleBuy} loading={busy === "buy"} disabled={Boolean(busy)}>Buy</Button>
            <Button variant="secondary" onClick={handleAdd} loading={busy === "add"} disabled={Boolean(busy)}>Add to Bag</Button>
          </div>
          {notice && (
            <Alert tone={notice.tone} className="mt-4">
              {notice.text} {notice.tone === "success" && notice.text.startsWith("Added") && <Link to="/purchase" className="font-semibold underline">Review bag</Link>}
            </Alert>
          )}

          <a
            href={whatsappLink(`Hi ${BRAND.name}, I'm interested in the ${item.name} (${formatPrice(item.price)}): ${productUrl}`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 rounded-xl py-3 text-[17px] text-[#128C7E] transition-colors hover:bg-[#25D366]/10"
          >
            Ask about this piece on WhatsApp<span aria-hidden="true"> ›</span>
          </a>

          <ul className="mt-8 divide-y divide-black/10 border-y border-black/10">
            {[
              { icon: Truck, ...PROMISES.delivery },
              { icon: ShieldCheck, ...PROMISES.securePayment },
            ].map(({ icon: Icon, title, detail }) => (
              <li key={title} className="flex gap-3 py-4">
                <Icon size={22} className="shrink-0 text-brand" />
                <div>
                  <p className="text-[17px] font-semibold text-ink">{title}</p>
                  <p className="text-[14px] text-muted">{detail}</p>
                </div>
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-[21px] font-semibold text-ink">Highlights</h2>
          <ul className="mt-3 space-y-2">
            {PRODUCT_HIGHLIGHTS.map((detail) => (
              <li key={detail} className="flex gap-2.5 text-[17px] text-ink/80">
                <Check size={18} className="mt-1 shrink-0 text-brand" />
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <RecentlyViewed excludeId={item._id} title="You recently viewed." className="bg-mist" />
      <Footbar />
    </main>
  );
};

export default ProductDetails;
