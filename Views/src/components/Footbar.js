import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { fetchCategories, titleCase } from '../lib/api';
import { BRAND } from '../content/site';
import MetalRates from './site/MetalRates';

// Apple-style global footer: footnotes, a link directory that collapses into
// accordions on small screens, and a legal row.
const Footer = () => {
  const [categories, setCategories] = useState([]);
  const [openColumn, setOpenColumn] = useState(null);

  useEffect(() => {
    fetchCategories().then((data) => setCategories(Array.isArray(data) ? data.filter(Boolean) : []));
  }, []);

  const directory = [
    {
      title: 'Shop and Learn',
      links: [
        { label: 'All Jewellery', to: '/list' },
        ...categories.map((c) => ({ label: titleCase(c), to: `/list?category=${encodeURIComponent(c)}` })),
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Manage your account', to: '/account' },
        { label: 'Your bag', to: '/purchase' },
        { label: 'Sign in', to: '/login' },
        { label: 'Create account', to: '/signup' },
        { label: 'Reset password', to: '/forget' },
      ],
    },
    {
      title: 'Bespoke',
      links: [
        { label: 'Sketchbook', to: '/#sketchbook' },
        { label: 'Commission a piece', to: '/chat' },
      ],
    },
    {
      title: 'Customer Care',
      links: [
        { label: 'Talk to a designer', to: '/chat' },
        { label: `Call ${BRAND.phone}`, href: BRAND.phoneHref },
        { label: 'Delivery details', to: '/user-details' },
      ],
    },
  ];

  const linkClass = 'text-[12px] leading-[1.33] text-ink/70 hover:text-ink hover:underline';

  return (
    <footer className="bg-mist text-[12px] text-muted">
      <div className="mx-auto max-w-content px-4 md:px-[22px]">
        <div className="border-b border-black/10 py-4 leading-[1.33]">
          <p>Product images are for illustration. As every piece is finished by hand, final weight and price may vary slightly with the day’s gold rate.</p>
        </div>

        <MetalRates variant="footer" />

        <nav aria-label="Footer" className="border-b border-black/10 py-2 md:grid md:grid-cols-4 md:gap-5 md:py-5">
          {directory.map((column) => {
            const open = openColumn === column.title;
            return (
              <div key={column.title} className="border-b border-black/10 last:border-b-0 md:border-b-0">
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenColumn(open ? null : column.title)}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between py-3 text-left text-[12px] font-semibold text-ink/80 md:pointer-events-none md:py-0 md:pb-2"
                  >
                    {column.title}
                    <Plus size={14} className={`transition-transform duration-300 md:hidden ${open ? 'rotate-45' : ''}`} />
                  </button>
                </h3>
                <ul className={`space-y-2 pb-4 md:block md:pb-0 ${open ? 'block animate-fade-down' : 'hidden'}`}>
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href ? (
                        <a href={link.href} className={linkClass}>{link.label}</a>
                      ) : (
                        <Link to={link.to} className={linkClass}>{link.label}</Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        <p className="pt-4">
          More ways to shop: <Link to="/chat" className="text-brand hover:underline">talk to a designer</Link> online or call{' '}
          <a href={BRAND.phoneHref} className="text-brand hover:underline">{BRAND.phone}</a>.
        </p>

        <div className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
          <p>Copyright © {new Date().getFullYear()} Govind Jewellers. All rights reserved.</p>
          <p className="text-ink/70">India</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
