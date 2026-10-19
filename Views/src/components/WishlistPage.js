import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../lib/savedList';
import { formatPrice } from '../lib/api';
import ProductCard from './site/ProductCard';
import PageMeta from './site/PageMeta';
import Footbar from './Footbar';
import { whatsappLink } from './site/WhatsAppButton';
import { BRAND } from '../content/site';

const WishlistPage = () => {
  const { items } = useWishlist();
  const total = items.reduce((sum, item) => sum + (item.price || 0), 0);

  // One WhatsApp message listing every saved piece, so the shopper can ask about them together
  const enquiry = `Hi ${BRAND.name}, I'd like to know more about these pieces from my wishlist:\n${items
    .map((item) => `• ${item.name}: ${BRAND.siteUrl}/product/${item._id}`)
    .join('\n')}`;

  return (
    <main className="bg-white pt-12">
      <PageMeta title="Your Wishlist" description="The pieces you've saved at Govind Jewellers." />
      <section className="mx-auto max-w-content px-6 pb-16 pt-12 md:px-[22px] md:pt-16">
        <h1 className="headline-tile">Your Wishlist.</h1>

        {items.length === 0 ? (
          <div className="mt-10 rounded-[18px] bg-mist px-6 py-16 text-center">
            <Heart size={40} className="mx-auto text-muted" />
            <p className="mt-4 text-[21px] font-semibold text-ink">Nothing saved yet.</p>
            <p className="mt-1 text-[17px] text-muted">Tap the heart on any piece to keep it here for later.</p>
            <Link to="/list" className="btn-filled mt-6">Shop jewellery</Link>
          </div>
        ) : (
          <>
            <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-[17px] text-muted">
                {items.length} {items.length === 1 ? 'piece' : 'pieces'} · {formatPrice(total)} in total
              </p>
              <a href={whatsappLink(enquiry)} target="_blank" rel="noopener noreferrer" className="btn-outline self-start text-[14px]">
                Ask about these on WhatsApp
              </a>
            </div>
            <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {items.map((item) => (
                <li key={item._id}>
                  <ProductCard item={item} />
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[12px] text-muted">Your wishlist is saved on this device.</p>
          </>
        )}
      </section>
      <Footbar />
    </main>
  );
};

export default WishlistPage;
