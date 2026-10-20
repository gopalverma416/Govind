import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchCategories, fetchItems, titleCase } from "../lib/api";
import LocalNav from "./site/LocalNav";
import ProductCard from "./site/ProductCard";
import PageMeta from "./site/PageMeta";
import Reveal from "./site/Reveal";
import { Select } from "./site/ui";
import Footbar from "./Footbar";

const SORTS = {
  featured: { label: "Featured", compare: null },
  newest: { label: "Newest", compare: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  "price-asc": { label: "Price: low to high", compare: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", compare: (a, b) => b.price - a.price },
};

const JewelryList = () => {
  const [items, setItems] = useState(null);
  const [categories, setCategories] = useState(["All"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "All";
  const sort = SORTS[searchParams.get("sort")] ? searchParams.get("sort") : "featured";

  const updateParams = (changes) => {
    const next = Object.fromEntries(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null) delete next[key];
      else next[key] = value;
    });
    setSearchParams(next);
  };
  const setSelectedCategory = (category) => updateParams({ category: category === "All" ? null : category });

  useEffect(() => {
    fetchCategories()
      .then((data) => setCategories(["All", ...data.filter(Boolean)]))
      .catch((error) => console.error("Error fetching categories:", error));
    fetchItems().then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  const visible = useMemo(() => {
    if (!items) return null;
    const filtered = selectedCategory === "All" ? items : items.filter((item) => item.category === selectedCategory);
    const { compare } = SORTS[sort];
    return compare ? filtered.slice().sort(compare) : filtered;
  }, [items, selectedCategory, sort]);

  const heading = selectedCategory === "All" ? "Jewellery" : titleCase(selectedCategory);

  return (
    <main className="min-h-screen bg-white pt-12">
      <PageMeta
        title={`Shop ${heading}`}
        description={`Shop handcrafted ${selectedCategory === "All" ? "jewellery" : selectedCategory} from Govind Jewellers.`}
      />
      <LocalNav
        title={heading}
        items={categories.map((category) => ({ key: category, label: category === "All" ? "All" : titleCase(category) }))}
        activeKey={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <section className="mx-auto max-w-[1180px] px-6 pb-20 pt-10 md:px-[22px] md:pt-14">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="headline-hero">Shop {heading}.</h2>
            <p className="mt-2 text-[17px] text-muted">Every piece is designed in our studio and finished by hand.</p>
          </div>
          <div className="flex items-center gap-3">
            {visible && <p className="whitespace-nowrap text-[14px] text-muted">{visible.length} {visible.length === 1 ? "piece" : "pieces"}</p>}
            <div className="w-[200px]">
              <Select aria-label="Sort by" value={sort} onChange={(e) => updateParams({ sort: e.target.value === "featured" ? null : e.target.value })} className="py-2 text-[14px]">
                {Object.entries(SORTS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </div>
          </div>
        </Reveal>

        {visible === null ? (
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="aspect-[3/4] animate-pulse rounded-[18px] bg-mist" />
            ))}
          </ul>
        ) : visible.length === 0 ? (
          <div className="mt-10 rounded-[18px] bg-mist px-6 py-16 text-center">
            <p className="text-[21px] font-semibold text-ink">New designs are on their way.</p>
            <p className="mt-1 text-[17px] text-muted">Nothing here just yet. Explore the rest of the collection in the meantime.</p>
            <button type="button" onClick={() => setSelectedCategory("All")} className="btn-filled mt-6">Shop all jewellery</button>
          </div>
        ) : (
          <ul className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {visible.map((item) => (
              <li key={item._id} id={`item-${item._id}`}>
                <ProductCard item={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <Footbar />
    </main>
  );
};

export default JewelryList;
