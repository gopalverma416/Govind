import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { fetchMetalRates, formatPrice } from "../../lib/api";

const REFRESH_MS = 5 * 60 * 1000;

const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

const disclaimerFor = (rates) =>
  rates.basis === "spot"
    ? "Indicative international spot price converted to rupees. Excludes import duty, GST and making charges, so store prices will be higher."
    : `Spot price plus ${rates.premiumPercent}% to reflect duties and taxes. Excludes making charges. Indicative only.`;

// Live gold and silver rates in INR. Refreshes every five minutes while the tab is visible.
const useMetalRates = () => {
  const [rates, setRates] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      if (document.hidden) return;
      fetchMetalRates()
        .then((data) => !cancelled && setRates(data))
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, REFRESH_MS);
    document.addEventListener("visibilitychange", load);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", load);
    };
  }, []);

  return rates;
};

/*
 * variant "strip": centred bar for the homepage, under the ribbon
 * variant "footer": compact line for the global footer
 */
const MetalRates = ({ variant = "strip" }) => {
  const rates = useMetalRates();
  if (!rates) return null;

  const items = [
    { label: "Gold 24K", value: formatPrice(rates.gold24kPer10g), unit: "/10 g" },
    { label: "Gold 22K", value: formatPrice(rates.gold22kPer10g), unit: "/10 g" },
    { label: "Silver", value: formatPrice(rates.silverPerKg), unit: "/kg" },
  ];
  const disclaimer = disclaimerFor(rates);

  if (variant === "footer") {
    return (
      <div className="border-b border-black/10 py-4">
        <p className="text-[12px] font-semibold text-ink/80">Today’s metal rates</p>
        <p className="mt-1 text-[12px] text-ink/70">
          {items.map((item, i) => (
            <span key={item.label} className="whitespace-nowrap">
              {i > 0 && <span className="mx-2 text-black/20">|</span>}
              {item.label} <span className="font-semibold tabular-nums text-ink">{item.value}</span>
              {item.unit}
            </span>
          ))}
        </p>
        <p className="mt-1">
          {disclaimer} Updated {formatTime(rates.updatedAt)} IST.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Today’s gold and silver rates" className="border-t border-black/5 bg-mist">
      <div className="mx-auto flex max-w-content flex-wrap items-center justify-center gap-x-6 gap-y-1 px-4 py-2.5 text-[12px] text-ink/80">
        <span className="flex items-center gap-1.5 font-semibold text-ink">
          <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live rates
        </span>
        {items.map((item) => (
          <span key={item.label} className="whitespace-nowrap">
            {item.label} <span className="font-semibold tabular-nums text-ink">{item.value}</span>
            <span className="text-muted">{item.unit}</span>
          </span>
        ))}
        <span className="group relative flex items-center gap-1 whitespace-nowrap text-muted">
          Updated {formatTime(rates.updatedAt)} IST
          <button type="button" aria-label="About these rates" className="peer flex h-6 w-6 items-center justify-center rounded-full hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/40">
            <Info size={13} />
          </button>
          <span
            role="tooltip"
            className="pointer-events-none absolute right-0 top-full z-20 mt-1 w-64 whitespace-normal rounded-xl bg-white p-3 text-[12px] leading-[1.4] text-ink/80 opacity-0 shadow-lg ring-1 ring-black/5 transition-opacity peer-hover:opacity-100 peer-focus:opacity-100"
          >
            {disclaimer}
          </span>
        </span>
      </div>
    </section>
  );
};

export default MetalRates;
