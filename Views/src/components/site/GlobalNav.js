import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Gem, Search, ShoppingBag } from "lucide-react";
import { fetchCart, fetchCategories, fetchItems, formatPrice, titleCase } from "../../lib/api";
import { getUserIdFromToken } from "../../utils/auth";
import { BRAND } from "../../content/site";

// Menu columns: the first column uses large links, the rest are small "quick links"
const buildMenus = (categories, items) => {
  const shopLinks = categories.map((c) => ({ label: titleCase(c), to: `/list?category=${encodeURIComponent(c)}` }));
  const helpColumn = {
    title: "More from Govind",
    links: [
      { label: "Bespoke design", to: "/chat" },
      { label: "Sketchbook", to: "/#sketchbook" },
      { label: "Talk to a designer", to: "/chat" },
    ],
  };

  return [
    {
      key: "store",
      label: "Store",
      to: "/list",
      columns: [
        { title: "Shop", large: true, links: [{ label: "Shop all jewellery", to: "/list" }, ...shopLinks] },
        {
          title: "Quick links",
          links: [
            { label: "Your bag", to: "/purchase" },
            { label: "Your account", to: "/account" },
            { label: "Delivery details", to: "/user-details" },
          ],
        },
        helpColumn,
      ],
    },
    ...categories.slice(0, 5).map((category) => {
      const name = titleCase(category);
      const to = `/list?category=${encodeURIComponent(category)}`;
      const pieces = items.filter((item) => item.category === category).slice(0, 5);
      return {
        key: category,
        label: name,
        to,
        columns: [
          {
            title: `Explore ${name}`,
            large: true,
            links: [{ label: `All ${name}`, to }, ...pieces.map((item) => ({ label: item.name, to: `/product/${item._id}` }))],
          },
          { title: `Shop ${name}`, links: [{ label: `Shop ${name}`, to }, { label: "Your bag", to: "/purchase" }] },
          helpColumn,
        ],
      };
    }),
    {
      key: "sketchbook",
      label: "Sketchbook",
      to: "/#sketchbook",
      columns: [
        {
          title: "Sketchbook",
          large: true,
          links: [
            { label: "Explore the Sketchbook", to: "/#sketchbook" },
            { label: "Commission a design", to: "/chat" },
          ],
        },
        { title: "Shop", links: [{ label: "Shop all jewellery", to: "/list" }] },
      ],
    },
    {
      key: "support",
      label: "Support",
      to: "/chat",
      columns: [
        {
          title: "Customer Care",
          large: true,
          links: [
            { label: "Talk to a designer", to: "/chat" },
            { label: "Manage your account", to: "/account" },
            { label: "Reset password", to: "/forget" },
          ],
        },
        { title: "Call us", links: [{ label: BRAND.phone, href: BRAND.phoneHref }] },
      ],
    },
  ];
};

const MenuLink = ({ link, large, onNavigate }) => {
  const className = large
    ? "block py-1.5 text-[24px] font-semibold leading-[1.17] text-ink hover:text-brand md:text-[24px]"
    : "block py-1 text-[12px] font-semibold leading-[1.33] text-ink/80 hover:text-brand";
  if (link.href) {
    return (
      <a href={link.href} className={className}>
        {link.label}
      </a>
    );
  }
  return (
    <Link to={link.to} onClick={onNavigate} className={className}>
      {link.label}
    </Link>
  );
};

const MenuColumns = ({ columns, onNavigate, stagger = false }) => (
  <div className="flex flex-col gap-8 md:flex-row md:gap-[44px]">
    {columns.map((column, ci) => (
      <div key={column.title} className={column.large ? "md:min-w-[260px]" : "md:min-w-[160px]"}>
        <h2 className="mb-3 text-[12px] font-normal text-muted">{column.title}</h2>
        <ul>
          {column.links.map((link, li) => (
            <li
              key={`${link.label}-${li}`}
              className={stagger ? "animate-fade-down" : undefined}
              style={stagger ? { animationDelay: `${(ci * 4 + li) * 25}ms` } : undefined}
            >
              <MenuLink link={link} large={column.large} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
);

const GlobalNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState(null);
  const [query, setQuery] = useState("");
  const hoverTimer = useRef(null);
  const searchInput = useRef(null);
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  useEffect(() => {
    fetchCategories().then((data) => setCategories(Array.isArray(data) ? data.filter(Boolean) : []));
    fetchItems().then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  // Refresh the bag badge whenever the route changes (e.g. after adding to bag)
  useEffect(() => {
    const userId = getUserIdFromToken();
    if (!userId) {
      setCartCount(0);
      return;
    }
    fetchCart(userId).then((cart) => setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 1), 0)));
  }, [location.pathname]);

  const closeAll = useCallback(() => {
    clearTimeout(hoverTimer.current);
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSub(null);
    setQuery("");
  }, []);

  useEffect(closeAll, [location.pathname, location.search, location.hash, closeAll]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && closeAll();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeAll]);

  useEffect(() => {
    const lock = mobileOpen || openMenu === "search" || openMenu === "bag";
    document.body.style.overflow = lock && window.innerWidth < 768 ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, openMenu]);

  useEffect(() => {
    if (openMenu === "search") searchInput.current?.focus();
  }, [openMenu]);

  const menus = useMemo(() => buildMenus(categories, items), [categories, items]);
  const activeMenu = menus.find((m) => m.key === openMenu);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter((item) => `${item.name} ${item.category || ""} ${item.description || ""}`.toLowerCase().includes(q))
      .slice(0, 6);
  }, [items, query]);

  // Hover intent: a short delay before the first flyout opens, instant switching after that
  const hoverOpen = (key) => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu(key), openMenu ? 0 : 160);
  };
  const hoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpenMenu((m) => (m === "search" || m === "bag" ? m : null)), 120);
  };
  const toggle = (key) => {
    clearTimeout(hoverTimer.current);
    setMobileOpen(false);
    setOpenMenu((m) => (m === key ? null : key));
  };

  const submitSearch = (e) => {
    e.preventDefault();
    if (results[0]) navigate(`/product/${results[0]._id}`);
    else navigate("/list");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    closeAll();
    navigate("/login");
  };

  const panelOpen = Boolean(openMenu) || mobileOpen;
  const iconButton = "flex h-12 w-10 items-center justify-center text-ink/80 transition-colors hover:text-ink";

  return (
    <>
      <nav
        aria-label="Global"
        onMouseLeave={hoverClose}
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
          panelOpen ? "bg-[#fafafc]" : "bg-[rgba(250,250,252,0.8)] backdrop-blur-xl backdrop-saturate-[1.8]"
        }`}
      >
        <div className="mx-auto flex h-12 max-w-content items-center justify-between px-4 md:px-[22px]">
          <Link to="/" aria-label="Govind Jewellers home" className="flex items-center gap-1.5 text-ink" onMouseEnter={hoverClose}>
            <Gem size={16} strokeWidth={2} className="text-brand" />
            <span className="text-[15px] font-semibold tracking-[-0.01em]">Govind</span>
          </Link>

          <ul className="mx-6 hidden flex-1 items-center justify-between md:flex">
            {menus.map((menu) => (
              <li key={menu.key} onMouseEnter={() => hoverOpen(menu.key)}>
                <Link
                  to={menu.to}
                  onFocus={() => setOpenMenu(menu.key)}
                  aria-expanded={openMenu === menu.key}
                  className={`block px-2 py-3 text-[12px] transition-colors ${openMenu === menu.key ? "text-ink" : "text-ink/80 hover:text-ink"}`}
                >
                  {menu.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center">
            <button type="button" aria-label="Search" aria-expanded={openMenu === "search"} onClick={() => toggle("search")} className={iconButton}>
              <Search size={16} />
            </button>
            <button type="button" aria-label={`Bag, ${cartCount} items`} aria-expanded={openMenu === "bag"} onClick={() => toggle("bag")} className={`${iconButton} relative`}>
              <ShoppingBag size={16} />
              {cartCount > 0 && (
                <span className="absolute bottom-[11px] right-[6px] flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-ink px-[3px] text-[9px] font-semibold text-white">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              onClick={() => {
                setOpenMenu(null);
                setMobileSub(null);
                setMobileOpen((o) => !o);
              }}
              className={`${iconButton} md:hidden`}
            >
              <span className="relative block h-3 w-[18px]">
                <span className={`absolute left-0 block h-[1.5px] w-full rounded bg-current transition-transform duration-300 ease-apple ${mobileOpen ? "top-[5px] rotate-45" : "top-0.5"}`} />
                <span className={`absolute left-0 block h-[1.5px] w-full rounded bg-current transition-transform duration-300 ease-apple ${mobileOpen ? "top-[5px] -rotate-45" : "top-[9px]"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Desktop mega-menu flyouts */}
        {activeMenu && (
          <div className="hidden border-b border-black/5 bg-[#fafafc] md:block" onMouseEnter={() => clearTimeout(hoverTimer.current)}>
            <div key={activeMenu.key} className="mx-auto max-w-content animate-fade-down px-[22px] pb-[84px] pt-10">
              <MenuColumns columns={activeMenu.columns} onNavigate={closeAll} />
            </div>
          </div>
        )}

        {/* Search flyout */}
        {openMenu === "search" && (
          <div className="h-[calc(100vh-48px)] overflow-y-auto border-b border-black/5 bg-[#fafafc] md:h-auto">
            <div className="mx-auto max-w-content animate-fade-down px-6 pb-16 pt-6 md:px-[22px] md:pt-10">
              <form onSubmit={submitSearch} className="flex items-center gap-3">
                <Search size={24} className="shrink-0 text-muted" />
                <input
                  ref={searchInput}
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Govind Jewellers"
                  aria-label="Search products"
                  className="w-full bg-transparent text-[24px] font-semibold text-ink placeholder:text-muted/70 focus:outline-none"
                />
              </form>
              <div className="mt-8">
                <h2 className="mb-3 text-[12px] text-muted">{query ? "Products" : "Quick links"}</h2>
                <ul>
                  {query && results.length === 0 && <li className="text-[14px] text-muted">No results. Try “ring” or “necklace”.</li>}
                  {(query ? results : []).map((item) => (
                    <li key={item._id}>
                      <Link to={`/product/${item._id}`} className="flex items-center gap-3 py-2 text-[14px] font-semibold text-ink hover:text-brand">
                        <img src={item.images?.[0]} alt="" className="h-10 w-10 rounded-lg bg-mist object-contain" loading="lazy" />
                        <span className="flex-1">{item.name}</span>
                        <span className="text-[12px] font-normal text-muted">{formatPrice(item.price)}</span>
                      </Link>
                    </li>
                  ))}
                  {!query &&
                    [{ label: "Shop all jewellery", to: "/list" }, ...categories.map((c) => ({ label: titleCase(c), to: `/list?category=${encodeURIComponent(c)}` })), { label: "Talk to a designer", to: "/chat" }].map((link) => (
                      <li key={link.label}>
                        <Link to={link.to} className="flex items-center gap-2 py-1.5 text-[14px] font-semibold text-ink/80 hover:text-brand">
                          <span aria-hidden="true">→</span> {link.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Bag flyout */}
        {openMenu === "bag" && (
          <div className="h-[calc(100vh-48px)] overflow-y-auto border-b border-black/5 bg-[#fafafc] md:h-auto">
            <div className="mx-auto max-w-content animate-fade-down px-6 pb-16 pt-8 md:px-[22px] md:pt-10">
              <h2 className="text-[24px] font-semibold text-ink">{cartCount > 0 ? "Your bag" : "Your bag is empty."}</h2>
              <p className="mt-2 text-[12px] text-muted">
                {cartCount > 0 ? `You have ${cartCount} ${cartCount === 1 ? "item" : "items"} in your bag.` : isAuthenticated ? "Find something you love in the Store." : "Sign in to see if you have any saved items."}
              </p>
              {cartCount > 0 ? (
                <Link to="/purchase" className="btn-filled mt-6 px-8 text-[14px]">Review bag</Link>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn-filled mt-6 px-8 text-[14px]">Sign in</Link>
              ) : (
                <Link to="/list" className="btn-filled mt-6 px-8 text-[14px]">Shop jewellery</Link>
              )}
              <h3 className="mb-2 mt-10 text-[12px] text-muted">My profile</h3>
              <ul className="space-y-1 text-[14px] font-semibold text-ink/80">
                <li><Link to="/purchase" className="hover:text-brand">Bag</Link></li>
                <li><Link to="/account" className="hover:text-brand">Account</Link></li>
                {isAuthenticated ? (
                  <li><button type="button" onClick={handleLogout} className="hover:text-brand">Sign out</button></li>
                ) : (
                  <>
                    <li><Link to="/login" className="hover:text-brand">Sign in</Link></li>
                    <li><Link to="/signup" className="hover:text-brand">Create account</Link></li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Mobile full-screen menu with drill-in submenus */}
        {mobileOpen && (
          <div className="h-[calc(100vh-48px)] overflow-y-auto bg-[#fafafc] md:hidden">
            {mobileSub ? (
              <div key={mobileSub} className="animate-fade-down px-8 pb-16 pt-4">
                <button type="button" onClick={() => setMobileSub(null)} className="-ml-2 mb-4 flex h-11 items-center text-muted" aria-label="Back to menu">
                  <ChevronLeft size={22} />
                </button>
                <MenuColumns columns={menus.find((m) => m.key === mobileSub)?.columns || []} onNavigate={closeAll} stagger />
              </div>
            ) : (
              <ul className="px-8 pb-16 pt-6">
                {menus.map((menu, i) => (
                  <li key={menu.key} className="animate-fade-down" style={{ animationDelay: `${i * 30}ms` }}>
                    <button type="button" onClick={() => setMobileSub(menu.key)} className="flex w-full items-center justify-between py-2 text-left text-[28px] font-semibold leading-[1.14] text-ink">
                      {menu.label}
                      <ChevronRight size={20} className="text-muted" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </nav>

      {/* Dims and blurs the page behind an open desktop flyout */}
      <div
        aria-hidden="true"
        onClick={closeAll}
        className={`fixed inset-0 z-40 hidden bg-black/20 backdrop-blur-[20px] transition-opacity duration-300 md:block ${openMenu ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />
    </>
  );
};

export default GlobalNav;
