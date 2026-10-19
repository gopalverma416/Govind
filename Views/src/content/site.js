// Brand copy and store promises shown across the site. Every customer-facing policy
// lives here so it stays consistent between the product page, bag and confirmation.
// Only list promises the store actually honours.

export const BRAND = {
  name: "Govind Jewellers",
  shortName: "Govind",
  phone: "+91 7247305879",
  phoneHref: "tel:+917247305879",
};

export const PROMISES = {
  delivery: { title: "Free insured delivery", detail: "On every order." },
  hallmark: { title: "BIS hallmarked gold", detail: "Certified purity in every gold piece." },
  exchange: { title: "Lifetime exchange", detail: "Exchange your Govind gold at any time." },
  securePayment: { title: "Secure checkout", detail: "Your payment details are encrypted." },
  packaging: "Arrives in a Govind presentation box.",
  deliveryEstimate: "3–5 business days",
};

// Tile copy per category; anything not listed falls back to DEFAULT_CATEGORY_COPY
export const CATEGORY_COPY = {
  rings: { tagline: "Made for the moments that matter." },
  necklaces: { tagline: "Statement pieces, finished by hand." },
  earrings: { tagline: "Light to wear. Hard to forget." },
  bracelets: { tagline: "Detail you can feel." },
  bangles: { tagline: "Tradition, in every curve." },
  pendants: { tagline: "Small piece. Big meaning." },
};

export const DEFAULT_CATEGORY_COPY = { tagline: "Designed in our studio. Finished by hand." };

export const PRODUCT_HIGHLIGHTS = [
  "Designed in our studio and finished by hand.",
  "Made to be worn every day and kept for generations.",
  PROMISES.packaging,
];
