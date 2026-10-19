import { recentlyViewed, useSavedList } from "../../lib/savedList";
import ProductCard from "./ProductCard";

// Horizontal row of the shopper's recently viewed pieces; hidden until there is something to show
const RecentlyViewed = ({ excludeId, title = "Recently viewed.", className = "" }) => {
  const items = useSavedList(recentlyViewed).filter((item) => item._id !== excludeId);
  if (items.length === 0) return null;

  return (
    <section aria-label="Recently viewed" className={`py-12 md:py-16 ${className}`}>
      <h2 className="mx-auto mb-6 max-w-content px-6 text-[28px] font-semibold leading-[1.14] text-ink md:px-[22px] md:text-[32px]">{title}</h2>
      <ul className="mx-auto flex max-w-content snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:px-[22px]">
        {items.map((item) => (
          <li key={item._id} className="w-[200px] shrink-0 snap-start md:w-[220px]">
            <ProductCard item={item} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default RecentlyViewed;
