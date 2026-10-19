import { Heart } from "lucide-react";
import { useWishlist } from "../../lib/savedList";

// Heart toggle that saves a product to the wishlist. Safe to place inside clickable cards.
const WishlistButton = ({ item, size = 20, className = "" }) => {
  const { isSaved, toggle } = useWishlist();
  const saved = isSaved(item._id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${item.name} from wishlist` : `Save ${item.name} to wishlist`}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        toggle(item);
      }}
      className={`flex items-center justify-center rounded-full bg-white/90 shadow-md transition-transform duration-200 hover:scale-110 active:scale-95 ${className}`}
    >
      <Heart size={size} className={saved ? "fill-rose-500 text-rose-500" : "text-ink/70"} />
    </button>
  );
};

export default WishlistButton;
