import { Link } from "react-router-dom";
import Reveal from "./Reveal";

// Half-width promo tile from the homepage grid: copy on top, product image filling the rest
const PromoTile = ({ title, subtitle, caption, ctas = [], image, imageAlt = "", theme = "light", delay = 0 }) => {
  const dark = theme === "dark";

  return (
    <Reveal
      delay={delay}
      className={`relative flex h-[490px] flex-col overflow-hidden text-center md:h-[580px] ${dark ? "bg-black text-white" : "bg-mist text-ink"}`}
    >
      <div className="relative z-10 px-6 pt-[46px] md:pt-[52px]">
        <h3 className="headline-tile">{title}</h3>
        {subtitle && <p className="mt-1 text-[19px] leading-[1.21] md:text-[24px] md:leading-[1.17]">{subtitle}</p>}
        {caption && <p className={`mt-1 text-[14px] ${dark ? "text-white/70" : "text-muted"}`}>{caption}</p>}
        {ctas.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            {ctas.map((cta, i) => (
              <Link
                key={cta.label}
                to={cta.to}
                className={`${i === 0 ? "btn-filled" : dark ? "btn-outline-dark" : "btn-outline"} px-[15px] py-[8px] text-[14px]`}
              >
                {cta.label}
              </Link>
            ))}
          </div>
        )}
      </div>
      {image && (
        <div className="relative flex-1">
          <img
            src={image}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-contain p-8 transition-transform duration-700 ease-apple hover:scale-[1.03]"
          />
        </div>
      )}
    </Reveal>
  );
};

export default PromoTile;
