import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { BRAND, PROMISES } from '../content/site';
import { formatPrice } from '../lib/api';
import { Card } from './site/ui';
import PageMeta from './site/PageMeta';
import { whatsappLink } from './site/WhatsAppButton';

const ThankYouPage = () => {
  const { state } = useLocation();
  const orderId = state?.orderId;
  // A short, readable reference derived from the order's database id
  const reference = orderId ? `GJ-${String(orderId).slice(-8).toUpperCase()}` : null;

  return (
    <main className="min-h-screen bg-mist px-4 pb-16 pt-24 md:pt-28">
      <PageMeta title="Order Confirmed" />
      <div className="mx-auto max-w-[560px] text-center">
        <CheckCircle2 size={56} strokeWidth={1.5} className="mx-auto text-emerald-500" />
        <h1 className="mt-5 text-[32px] font-semibold leading-[1.125] text-ink md:text-[40px]">Thank you for your order.</h1>
        <p className="mt-3 text-[17px] text-muted">
          We’re preparing your pieces with care. Our team will call you shortly to confirm your order and payment.
        </p>

        <Card className="mt-8 text-left">
          <dl className="space-y-3 text-[17px]">
            {reference && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Order reference</dt>
                <dd className="font-semibold tabular-nums text-ink">{reference}</dd>
              </div>
            )}
            {typeof state?.total === 'number' && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Total</dt>
                <dd className="tabular-nums text-ink">{formatPrice(state.total)}</dd>
              </div>
            )}
            {state?.paymentMethod && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Payment</dt>
                <dd className="text-ink">{state.paymentMethod}</dd>
              </div>
            )}
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Estimated delivery</dt>
              <dd className="text-ink">{PROMISES.deliveryEstimate}</dd>
            </div>
          </dl>
        </Card>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/list" className="btn-filled">Continue shopping</Link>
          <a
            href={whatsappLink(`Hi ${BRAND.name}, I have a question about my order${reference ? ` ${reference}` : ''}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline"
          >
            Ask about your order
          </a>
        </div>
        <p className="mt-8 text-[14px] text-muted">
          Questions? Call us on <a href={BRAND.phoneHref} className="text-brand hover:underline">{BRAND.phone}</a>.
        </p>
      </div>
    </main>
  );
};

export default ThankYouPage;
