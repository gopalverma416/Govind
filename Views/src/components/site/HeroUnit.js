import { Link } from "react-router-dom";
import useCarousel from "../../hooks/useCarousel";
import useInView from "../../hooks/useInView";
import Reveal from "./Reveal";
import TimedDots from "./TimedDots";

const SLIDE_MS = 5000;

const Cta = ({ cta, primary, dark }) => {
  const className = primary ? "btn-filled" : dark ? "btn-outline-dark" : "btn-outline";
  return cta.href ? (
    <a href={cta.href} className={className}>{cta.label}</a>
  ) : (
    <Link to={cta.to} className={className}>{cta.label}</Link>
  );
};

/*
 * Full-width homepage hero: centred headline, subhead, a pair of pill CTAs and an image
 * underneath. Several images crossfade on a timer with Apple-style dot navigation.
 */
const HeroUnit = ({ eyebrow, title, subtitle, ctas = [], images = [], imageAlt = "", theme = "light", imageFit = "cover", priority = false }) => {
  const dark = theme === "dark";
  const [ref, inView] = useInView({ threshold: 0.3 });
  const { index, setIndex, next, playing, running, togglePlay } = useCarousel(images.length, { inView });

  return (
    <section ref={ref} className={`relative overflow-hidden text-center ${dark ? "bg-black text-white" : "bg-mist text-ink"}`}>
      <Reveal className="relative z-10 mx-auto max-w-content px-6 pt-[52px] md:pt-[60px]">
        {eyebrow && <p className={`mb-1 text-[17px] font-semibold md:text-[21px] ${dark ? "text-brand-light" : "text-brand"}`}>{eyebrow}</p>}
        <h2 className="headline-hero">{title}</h2>
        {subtitle && <p className="subhead-hero mt-1.5">{subtitle}</p>}
        {ctas.length > 0 && (
          <div className="mt-[18px] flex flex-wrap items-center justify-center gap-[14px]">
            {ctas.map((cta, i) => (
              <Cta key={cta.label} cta={cta} primary={i === 0} dark={dark} />
            ))}
          </div>
        )}
      </Reveal>

      <div className="relative mx-auto mt-8 h-[360px] max-w-wide md:mt-10 md:h-[520px]">
        {images.map((src, i) => (
          <img
            key={src}
            src={src}
            alt={i === index ? imageAlt : ""}
            aria-hidden={i !== index}
            loading={priority && i === 0 ? "eager" : "lazy"}
            decoding="async"
            className={`absolute inset-0 h-full w-full transition-[opacity,transform] duration-[1200ms] ease-apple ${
              imageFit === "contain" ? "object-contain p-6" : "object-cover"
            } ${i === index ? "scale-100 opacity-100" : "scale-[1.03] opacity-0"}`}
          />
        ))}
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-6 z-10">
            <TimedDots
              count={images.length}
              index={index}
              onSelect={setIndex}
              onComplete={next}
              playing={playing}
              running={running}
              onTogglePlay={togglePlay}
              duration={SLIDE_MS}
              theme={dark || imageFit === "cover" ? "dark" : "light"}
              label="image"
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroUnit;
