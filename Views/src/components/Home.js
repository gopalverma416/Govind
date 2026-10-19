import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Footbar from './Footbar';
import Ribbon from './site/Ribbon';
import HeroUnit from './site/HeroUnit';
import PromoTile from './site/PromoTile';
import MediaGallery from './site/MediaGallery';
import MetalRates from './site/MetalRates';
import { fetchItems, fetchSketches, fetchSlides, formatPrice, titleCase } from '../lib/api';
import { CATEGORY_COPY, DEFAULT_CATEGORY_COPY } from '../content/site';

const FALLBACK_HERO = 'https://res.cloudinary.com/denstpvkw/image/upload/v1741432943/jewelry-images/cwcnzqtrrb9kaagfphgg.webp';

const Home = () => {
  const location = useLocation();
  const [items, setItems] = useState(null);
  const [slides, setSlides] = useState([]);
  const [sketches, setSketches] = useState([]);
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  useEffect(() => {
    fetchItems().then((data) => setItems(Array.isArray(data) ? data : []));
    fetchSlides().then((data) => setSlides(Array.isArray(data) ? data : []));
    fetchSketches().then((data) => setSketches(Array.isArray(data) ? data : []));
  }, []);

  // Support /#sketchbook links from the nav and footer
  useEffect(() => {
    if (!location.hash) return;
    document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [location.hash, sketches.length]);

  const newest = useMemo(
    () => (items || []).slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0],
    [items]
  );

  const tiles = useMemo(() => {
    if (!items) return [];
    const byCategory = new Map();
    items.forEach((item) => {
      if (!item.category) return;
      if (!byCategory.has(item.category)) byCategory.set(item.category, []);
      byCategory.get(item.category).push(item);
    });

    const categoryTiles = [...byCategory.entries()].map(([category, pieces]) => {
      const name = titleCase(category);
      const to = `/list?category=${encodeURIComponent(category)}`;
      const copy = CATEGORY_COPY[category.toLowerCase()] || DEFAULT_CATEGORY_COPY;
      return {
        key: category,
        title: name,
        subtitle: copy.tagline,
        caption: `From ${formatPrice(Math.min(...pieces.map((p) => p.price)))}`,
        image: pieces[0].images?.[0],
        imageAlt: pieces[0].name,
        ctas: [{ label: 'Shop', to }, { label: 'Learn more', to: `/product/${pieces[0]._id}` }],
      };
    });

    const extraTiles = [
      {
        key: 'bespoke',
        title: 'Bespoke',
        subtitle: 'Your idea. Our hands.',
        caption: 'Share a sketch, a photo or just a feeling. Our designers take it from there.',
        ctas: [{ label: 'Start a design', to: '/chat' }],
        image: sketches[0]?.imageUrl,
        imageAlt: 'A design from the Govind sketchbook',
      },
      isAuthenticated
        ? { key: 'account', title: 'Govind Account', subtitle: 'Everything you love, in one place.', caption: 'Your bag, your orders and your delivery details.', ctas: [{ label: 'Go to your account', to: '/account' }, { label: 'View bag', to: '/purchase' }] }
        : { key: 'join', title: 'Govind Account', subtitle: 'Everything you love, in one place.', caption: 'Save your bag, check out faster and keep track of your orders.', ctas: [{ label: 'Create account', to: '/signup' }, { label: 'Sign in', to: '/login' }] },
    ];

    // Keep the two-column grid even
    const all = [...categoryTiles, ...extraTiles];
    return all.length % 2 === 0 ? all : all.slice(0, -1);
  }, [items, sketches, isAuthenticated]);

  // Apple's grid alternates light and dark tiles in a checkerboard
  const themeFor = (i) => ((Math.floor(i / 2) + i) % 2 === 0 ? 'light' : 'dark');

  const heroImages = slides.length ? slides.map((s) => s.imageUrl) : [FALLBACK_HERO];

  return (
    <main className="bg-white pt-12">
      <Ribbon linkText="Talk to a designer" to="/chat">
        Every Govind piece begins as a hand-drawn sketch. Commission one of your own.
      </Ribbon>
      <MetalRates />

      <HeroUnit
        theme="dark"
        eyebrow="Govind Jewellers"
        title="Crafted to be treasured."
        subtitle="Fine jewellery, drawn by hand and made to last for generations."
        ctas={[{ label: 'Shop the collection', to: '/list' }, { label: 'See the sketchbook', to: '/#sketchbook' }]}
        images={heroImages}
        imageAlt="The Govind Jewellers collection"
        priority
      />

      {newest && (
        <div className="mt-3">
          <HeroUnit
            eyebrow="New arrival"
            title={newest.name}
            subtitle={newest.description || `${formatPrice(newest.price)}${newest.weight ? ` · ${newest.weight} g` : ''}`}
            ctas={[
              { label: 'Learn more', to: `/product/${newest._id}` },
              { label: 'Buy', to: `/product/${newest._id}` },
            ]}
            images={newest.images || []}
            imageAlt={newest.name}
            imageFit="contain"
          />
        </div>
      )}

      <section aria-label="Collections" className="grid gap-3 p-3 md:grid-cols-2">
        {items === null
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-[490px] animate-pulse bg-mist md:h-[580px]" />)
          : tiles.map((tile, i) => <PromoTile key={tile.key} {...tile} theme={themeFor(i)} delay={(i % 2) * 120} />)}
      </section>

      <MediaGallery
        id="sketchbook"
        heading="From our sketchbook."
        slides={sketches.map((sketch, i) => ({
          image: sketch.imageUrl,
          title: `Design No. ${String(i + 1).padStart(2, '0')}`,
          caption: 'Drawn by hand in our studio.',
          cta: { label: 'Make it yours', to: '/chat' },
        }))}
      />

      <Footbar />
    </main>
  );
};

export default Home;
