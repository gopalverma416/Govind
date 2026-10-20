import { Link } from "react-router-dom";
import { formatPrice, titleCase } from "../../lib/api";
import WishlistButton from "./WishlistButton";

// Product card used on the shop grid, wishlist and recently viewed rows
const ProductCard = ({ item, className = "" }) => (
  <Link
    to={`/product/${item._id}`}
    className={`group relative flex flex-col overflow-hidden rounded-[18px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow duration-300 hover:shadow-[0_8px_28px_rgba(0,0,0,0.12)] ${className}`}
  >
    <div className="relative aspect-square bg-mist">
      {(item.image || item.images?.[0]) && (
        <img
          src={item.image || item.images?.[0]}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 ease-apple group-hover:scale-105"
        />
      )}
      <WishlistButton item={item} size={16} className="absolute right-3 top-3 h-9 w-9" />
    </div>
    <div className="p-4">
      {item.category && <p className="text-[12px] font-semibold text-brand">{titleCase(item.category)}</p>}
      <p className="mt-0.5 truncate text-[17px] font-semibold text-ink">{item.name}</p>
      {typeof item.price === "number" && <p className="mt-1 text-[14px] text-ink/70">{formatPrice(item.price)}</p>}
    </div>
  </Link>
);

export default ProductCard;
