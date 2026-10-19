import { Pause, Play } from "lucide-react";

/*
 * Apple-style timed dot navigation: the active dot stretches into a pill whose fill
 * runs for `duration` ms, then calls `onComplete` to advance. `playing` is the user's choice
 * (drives the button icon); `running` also accounts for visibility and freezes the fill.
 */
const TimedDots = ({ count, index, onSelect, onComplete, playing, running = playing, onTogglePlay, duration = 5000, theme = "light", label = "slide" }) => {
  if (count < 2) return null;

  const dark = theme === "dark";
  const track = dark ? "bg-white/30" : "bg-black/20";
  const fill = dark ? "bg-white" : "bg-ink";

  return (
    <div className="flex items-center justify-center gap-3">
      <div className={`flex items-center gap-2.5 rounded-full px-4 py-3 backdrop-blur-md ${dark ? "bg-white/10" : "bg-black/[0.06]"}`}>
        {Array.from({ length: count }).map((_, i) => {
          const active = i === index;
          return (
            <button
              key={i}
              type="button"
              aria-label={`Show ${label} ${i + 1} of ${count}`}
              aria-current={active ? "true" : undefined}
              onClick={() => onSelect(i)}
              className={`relative h-2 overflow-hidden rounded-full transition-all duration-500 ease-apple ${track} ${active ? "w-12" : "w-2 hover:opacity-70"}`}
            >
              {active && (
                <span
                  key={`${index}-${duration}`}
                  onAnimationEnd={onComplete}
                  className={`progress-fill absolute inset-0 rounded-full ${fill}`}
                  style={{ animationDuration: `${duration}ms`, animationPlayState: running ? "running" : "paused" }}
                />
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? `Pause ${label}s` : `Play ${label}s`}
        className={`flex h-[44px] w-[44px] items-center justify-center rounded-full backdrop-blur-md transition-colors ${dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-black/[0.06] text-ink hover:bg-black/10"}`}
      >
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
    </div>
  );
};

export default TimedDots;
