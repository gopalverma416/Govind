import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Footbar from './Footbar';
import Ribbon from './site/Ribbon';
import HeroUnit from './site/HeroUnit';
import PromoTile from './site/PromoTile';
import MediaGallery from './site/MediaGallery';
import { fetchItems, fetchSketches, fetchSlides, formatPrice, titleCase } from '../lib/api';

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
      return {
        key: category,
        title: name,
        subtitle: `From ${formatPrice(Math.min(...pieces.map((p) => p.price)))}`,
        caption: `${pieces.length} ${pieces.length === 1 ? 'design' : 'designs'}`,
        image: pieces[0].images?.[0],
        imageAlt: pieces[0].name,
        ctas: [{ label: `Shop ${name}`, to }, { label: 'Learn more', to: `/product/${pieces[0]._id}` }],
      };
    });

    const extraTiles = [
      {
        key: 'bespoke',
        title: 'Made just for you.',
        subtitle: 'Bring us an idea. We’ll sketch it, then craft it.',
        ctas: [{ label: 'Chat with a designer', to: '/chat' }],
        image: sketches[0]?.imageUrl,
        imageAlt: 'A design from the Govind sketchbook',
      },
      isAuthenticated
        ? { key: 'account', title: 'Your Govind account.', subtitle: 'Your bag, orders and details in one place.', ctas: [{ label: 'Go to account', to: '/account' }, { label: 'View bag', to: '/purchase' }] }
        : { key: 'join', title: 'Join Govind.', subtitle: 'Save your bag and check out faster.', ctas: [{ label: 'Create account', to: '/signup' }, { label: 'Sign in', to: '/login' }] },
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
      <Ribbon linkText="Chat with a designer" to="/chat">
        Every piece starts as a sketch. Commission one of your own.
      </Ribbon>

      <HeroUnit
        theme="dark"
        eyebrow="Govind Jewellers"
        title="Timeless elegance."
        subtitle="Jewellery crafted with passion, designed for generations."
        ctas={[{ label: 'Shop now', to: '/list' }, { label: 'Explore the sketchbook', to: '/#sketchbook' }]}
        images={heroImages}
        imageAlt="Govind Jewellers collection"
        priority
      />

      {newest && (
        <div className="mt-3">
          <HeroUnit
            eyebrow="New"
            title={newest.name}
            subtitle={newest.description || `From ${formatPrice(newest.price)}${newest.weight ? ` · ${newest.weight} g` : ''}`}
            ctas={[
              { label: 'Learn more', to: `/product/${newest._id}` },
              ...(newest.category ? [{ label: `Shop ${titleCase(newest.category)}`, to: `/list?category=${encodeURIComponent(newest.category)}` }] : []),
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
        heading="Straight out of the sketchbook."
        slides={sketches.map((sketch, i) => ({
          image: sketch.imageUrl,
          title: `Sketch no. ${i + 1}`,
          caption: 'Hand-drawn in our studio',
          cta: { label: 'Make it yours', to: '/chat' },
        }))}
      />

      <Footbar />
    </main>
  );
};

export default Home;
