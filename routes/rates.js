const express = require("express");

const router = express.Router();

// Live spot prices (per troy ounce) quoted directly in INR; free and keyless
const PROVIDER = "https://api.gold-api.com/price";
const GRAMS_PER_TROY_OUNCE = 31.1034768;
const CACHE_MS = 5 * 60 * 1000;

// Optional store premium over spot (e.g. duty + GST), as a percentage. Defaults to 0 = pure spot.
const PREMIUM_PERCENT = Number(process.env.METAL_RATE_PREMIUM_PERCENT) || 0;

let cache = null;

const fetchSpot = async (symbol) => {
  const res = await fetch(`${PROVIDER}/${symbol}/INR`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${symbol} rate request failed with ${res.status}`);
  const data = await res.json();
  if (typeof data.price !== "number") throw new Error(`${symbol} rate response had no price`);
  return data;
};

const buildRates = (gold, silver) => {
  const factor = 1 + PREMIUM_PERCENT / 100;
  const perGram = (pricePerOunce) => (pricePerOunce / GRAMS_PER_TROY_OUNCE) * factor;
  const gold24 = perGram(gold.price);
  return {
    currency: "INR",
    gold24kPer10g: Math.round(gold24 * 10),
    gold22kPer10g: Math.round(gold24 * (22 / 24) * 10),
    silverPerKg: Math.round(perGram(silver.price) * 1000),
    premiumPercent: PREMIUM_PERCENT,
    basis: PREMIUM_PERCENT ? "spot-plus-premium" : "spot",
    source: "gold-api.com",
    updatedAt: [gold.updatedAt, silver.updatedAt].sort().pop(),
    fetchedAt: new Date().toISOString(),
  };
};

// GET /api/rates: gold (24K, 22K per 10 g) and silver (per kg) in INR, cached for five minutes
router.get("/", async (req, res) => {
  if (cache && Date.now() - cache.time < CACHE_MS) {
    return res.json(cache.rates);
  }
  try {
    const [gold, silver] = await Promise.all([fetchSpot("XAU"), fetchSpot("XAG")]);
    cache = { time: Date.now(), rates: buildRates(gold, silver) };
    res.set("Cache-Control", "public, max-age=60");
    res.json(cache.rates);
  } catch (err) {
    console.error("Error fetching metal rates:", err.message);
    // Serve the last good rates rather than nothing, flagged as stale
    if (cache) return res.json({ ...cache.rates, stale: true });
    res.status(502).json({ message: "Metal rates are unavailable right now" });
  }
});

module.exports = router;
