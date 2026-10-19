import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/api';
import { disclaimerFor, formatTime, useMetalRates } from './site/MetalRates';
import PageMeta from './site/PageMeta';
import Reveal from './site/Reveal';
import Footbar from './Footbar';

const GST_RATE = 0.03; // GST on gold and silver jewellery in India

// Purity as a fraction of the pure metal priced by the rate feed
const PURITIES = {
  gold: [
    { key: '24', label: '24K (999)', fraction: 1 },
    { key: '22', label: '22K (916)', fraction: 22 / 24 },
    { key: '18', label: '18K (750)', fraction: 18 / 24 },
    { key: '14', label: '14K (585)', fraction: 14 / 24 },
  ],
  silver: [
    { key: '999', label: 'Fine silver (999)', fraction: 0.999 },
    { key: '925', label: 'Sterling silver (925)', fraction: 0.925 },
  ],
};

const Field = ({ label, htmlFor, children, hint }) => (
  <div>
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-semibold text-ink/80">{label}</label>
    {children}
    {hint && <p className="mt-1 text-[12px] text-muted">{hint}</p>}
  </div>
);

const inputClass =
  'w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-[17px] text-ink focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15';

const GoldRatePage = () => {
  const rates = useMetalRates();
  const [metal, setMetal] = useState('gold');
  const [purityKey, setPurityKey] = useState('22');
  const [weight, setWeight] = useState('10');
  const [making, setMaking] = useState('');
  const [withGst, setWithGst] = useState(true);

  const perGramPure = rates ? (metal === 'gold' ? rates.gold24kPer10g / 10 : rates.silverPerKg / 1000) : 0;
  const purity = PURITIES[metal].find((p) => p.key === purityKey) || PURITIES[metal][0];

  const estimate = useMemo(() => {
    const grams = parseFloat(weight);
    if (!rates || !(grams > 0)) return null;
    const ratePerGram = perGramPure * purity.fraction;
    const metalValue = ratePerGram * grams;
    const makingCharges = metalValue * ((parseFloat(making) || 0) / 100);
    const gst = withGst ? (metalValue + makingCharges) * GST_RATE : 0;
    return { ratePerGram, metalValue, makingCharges, gst, total: metalValue + makingCharges + gst };
  }, [rates, weight, making, withGst, perGramPure, purity]);

  const switchMetal = (next) => {
    setMetal(next);
    setPurityKey(next === 'gold' ? '22' : '925');
  };

  const cards = rates
    ? [
        { label: 'Gold 24K', value: rates.gold24kPer10g, unit: 'per 10 g' },
        { label: 'Gold 22K', value: rates.gold22kPer10g, unit: 'per 10 g' },
        { label: 'Gold 18K', value: Math.round((rates.gold24kPer10g * 18) / 24), unit: 'per 10 g' },
        { label: 'Silver', value: rates.silverPerKg, unit: 'per kg' },
      ]
    : [];

  return (
    <main className="bg-white pt-12">
      <PageMeta
        title="Gold Rate Today in India"
        description="Today's indicative gold and silver rates in rupees, with a calculator for metal value, making charges and GST."
      />

      <section className="bg-mist">
        <Reveal className="mx-auto max-w-content px-6 pb-12 pt-14 text-center md:px-[22px] md:pt-20">
          <p className="text-[17px] font-semibold text-brand">Today’s rates</p>
          <h1 className="headline-hero mt-1">Gold and silver, live.</h1>
          <p className="subhead-hero mx-auto mt-2 max-w-[640px] text-ink/80">
            Know the value of your gold before you buy, sell or exchange.
          </p>
          {rates && <p className="mt-4 text-[14px] text-muted">Updated {formatTime(rates.updatedAt)} IST · refreshes every 5 minutes</p>}
        </Reveal>

        <div className="mx-auto grid max-w-content grid-cols-2 gap-3 px-6 pb-14 md:grid-cols-4 md:px-[22px]">
          {(cards.length ? cards : Array.from({ length: 4 })).map((card, i) => (
            <div key={card?.label || i} className="rounded-[18px] bg-white p-5 text-center shadow-[0_4px_16px_rgba(0,0,0,0.05)]">
              {card ? (
                <>
                  <p className="text-[14px] font-semibold text-ink/70">{card.label}</p>
                  <p className="mt-1 text-[24px] font-semibold tabular-nums text-ink md:text-[28px]">{formatPrice(card.value)}</p>
                  <p className="text-[12px] text-muted">{card.unit}</p>
                </>
              ) : (
                <div className="h-[76px] animate-pulse rounded-xl bg-mist" />
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-content px-6 py-14 md:px-[22px] md:py-20">
        <h2 className="headline-tile">Gold value calculator.</h2>
        <p className="mt-2 max-w-[640px] text-[17px] text-muted">
          Enter a weight and purity to see what the metal is worth at today’s rate. Add making charges to estimate the price of a finished piece.
        </p>

        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="inline-flex rounded-full bg-mist p-1" role="radiogroup" aria-label="Metal">
              {['gold', 'silver'].map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={metal === m}
                  onClick={() => switchMetal(m)}
                  className={`rounded-full px-6 py-2 text-[14px] font-semibold capitalize transition-colors ${metal === m ? 'bg-white text-ink shadow-sm' : 'text-ink/60 hover:text-ink'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            <Field label="Purity" htmlFor="purity">
              <select id="purity" value={purity.key} onChange={(e) => setPurityKey(e.target.value)} className={inputClass}>
                {PURITIES[metal].map((p) => (
                  <option key={p.key} value={p.key}>{p.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Weight (grams)" htmlFor="weight">
              <input id="weight" type="number" inputMode="decimal" min="0" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} className={inputClass} />
            </Field>

            <Field label="Making charges (%)" htmlFor="making" hint="Optional. Typically quoted by the jeweller per piece.">
              <input id="making" type="number" inputMode="decimal" min="0" step="0.5" placeholder="0" value={making} onChange={(e) => setMaking(e.target.value)} className={inputClass} />
            </Field>

            <label className="flex cursor-pointer items-center gap-3 text-[14px] text-ink">
              <input type="checkbox" checked={withGst} onChange={(e) => setWithGst(e.target.checked)} className="h-5 w-5 rounded accent-[#8a6a24]" />
              Include 3% GST
            </label>
          </form>

          <div className="rounded-[18px] bg-ink p-8 text-white" aria-live="polite">
            <p className="text-[14px] text-white/60">Estimated value</p>
            <p className="mt-1 text-[40px] font-semibold leading-tight tabular-nums md:text-[48px]">
              {estimate ? formatPrice(estimate.total) : '—'}
            </p>
            {estimate && (
              <dl className="mt-6 space-y-3 border-t border-white/15 pt-6 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-white/60">Rate ({purity.label})</dt>
                  <dd className="tabular-nums">{formatPrice(estimate.ratePerGram)}/g</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-white/60">Metal value</dt>
                  <dd className="tabular-nums">{formatPrice(estimate.metalValue)}</dd>
                </div>
                {estimate.makingCharges > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">Making charges ({making}%)</dt>
                    <dd className="tabular-nums">{formatPrice(estimate.makingCharges)}</dd>
                  </div>
                )}
                {withGst && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-white/60">GST (3%)</dt>
                    <dd className="tabular-nums">{formatPrice(estimate.gst)}</dd>
                  </div>
                )}
              </dl>
            )}
            <Link to="/list" className="btn-pill mt-8 bg-white text-[14px] text-ink hover:bg-white/85">Shop jewellery</Link>
          </div>
        </div>

        {rates && <p className="mt-8 text-[12px] leading-[1.5] text-muted">{disclaimerFor(rates)} This calculator gives an estimate only and is not a quote.</p>}
      </section>

      <Footbar />
    </main>
  );
};

export default GoldRatePage;
