import { Link } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import useCarousel from "../../hooks/useCarousel";
import useInView from "../../hooks/useInView";
import TimedDots from "./TimedDots";

const SLIDE_MS = 6000;

/*
 * Peeking, auto-advancing gallery modelled on apple.com's "Endless entertainment" section.
 * The centred slide is fully lit, neighbours peek in dimmed and are clickable, and the
 * timer pauses while the gallery is off screen.
 * slides: [{ image, title, caption, cta: { label, to } }]
 */
const MediaGallery = ({ id, heading, slides = [] }) => {
  const [ref, inView] = useInView({ threshold: 0.35 });
  const { index, setIndex, next, prev, playing, running, togglePlay } = useCarousel(slides.length, { inView });
  const swipe = useSwipeable({ onSwipedLeft: next, onSwipedRight: prev, trackMouse: true, preventScrollOnSwipe: true });

  if (slides.length === 0) return null;

  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  return (
    <section id={id} ref={ref} className="scroll-mt-12 overflow-hidden bg-black py-14 text-white md:py-20">
      {heading && <h2 className="headline-tile mx-auto mb-10 max-w-content px-6 text-center">{heading}</h2>}

      <div
        {...swipe}
        role="region"
        aria-roledescription="carousel"
        aria-label={heading || "Gallery"}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="focus:outline-none [--gap:12px] [--slide:86%] md:[--gap:20px] md:[--slide:72%]"
      >
        <ul
          className="flex w-full gap-[var(--gap)] transition-transform duration-1000 ease-apple"
          style={{ transform: `translateX(calc((100% - var(--slide)) / 2 - ${index} * (var(--slide) + var(--gap))))` }}
        >
          {slides.map((slide, i) => {
            const active = i === index;
            return (
              <li
                key={slide.image}
                aria-hidden={!active}
                onClick={() => !active && setIndex(i)}
                className={`relative aspect-[4/5] w-[var(--slide)] shrink-0 overflow-hidden rounded-[18px] bg-[#111] transition-opacity duration-700 sm:aspect-[16/10] md:aspect-[16/9] ${
                  active ? "opacity-100" : "cursor-pointer opacity-40 hover:opacity-60"
                }`}
              >
                <img src={slide.image} alt={slide.title || ""} loading="lazy" decoding="async" draggable="false" className="h-full w-full select-none object-contain" />
                <div
                  className={`absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 transition-opacity duration-500 md:flex-row md:items-end md:justify-between md:p-8 md:pt-24 ${
                    active ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <div>
                    {slide.title && <p className="text-[21px] font-semibold leading-tight md:text-[24px]">{slide.title}</p>}
                    {slide.caption && <p className="mt-1 text-[14px] text-white/75">{slide.caption}</p>}
                  </div>
                  {slide.cta && (
                    <Link to={slide.cta.to} tabIndex={active ? 0 : -1} className="btn-pill bg-white px-[15px] py-[8px] text-[14px] text-ink hover:bg-white/85">
                      {slide.cta.label}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8">
        <TimedDots
          count={slides.length}
          index={index}
          onSelect={setIndex}
          onComplete={next}
          playing={playing}
          running={running}
          onTogglePlay={togglePlay}
          duration={SLIDE_MS}
          theme="dark"
          label="design"
        />
      </div>
    </section>
  );
};

export default MediaGallery;
