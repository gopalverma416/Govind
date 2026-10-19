import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";

/*
 * Sticky product-level nav that sits under the global nav, like Apple's ac-localnav:
 * title on the left, section links on the right, collapsing to a dropdown on small screens.
 */
const LocalNav = ({ title, items = [], activeKey, onSelect, action }) => {
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const select = (key) => {
    setOpen(false);
    onSelect(key);
  };

  return (
    <div className={`sticky top-12 z-30 transition-colors duration-300 ${stuck ? "bg-[rgba(255,255,255,0.72)] backdrop-blur-xl backdrop-saturate-[1.8]" : "bg-transparent"}`}>
      <div className="mx-auto flex h-[52px] max-w-content items-center justify-between border-b border-black/10 px-4 md:px-[22px]">
        <h1 className="text-[21px] font-semibold tracking-[0.011em] text-ink">{title}</h1>

        <div className="flex items-center gap-4">
          <ul className="hidden items-center gap-6 md:flex">
            {items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => select(item.key)}
                  aria-current={item.key === activeKey ? "page" : undefined}
                  className={`text-[12px] transition-colors ${item.key === activeKey ? "text-ink" : "text-ink/70 hover:text-brand"}`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label="Show categories"
            className="flex h-11 w-8 items-center justify-center text-ink/70 md:hidden"
          >
            <ChevronDown size={18} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>
          {action}
        </div>
      </div>

      {open && (
        <ul className="animate-fade-down border-b border-black/10 bg-white/95 px-4 pb-4 backdrop-blur-xl md:hidden">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => select(item.key)}
                className={`block w-full border-b border-black/5 py-3 text-left text-[14px] ${item.key === activeKey ? "font-semibold text-ink" : "text-ink/80"}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocalNav;
