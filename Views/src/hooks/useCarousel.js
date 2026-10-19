import { useCallback, useEffect, useState } from "react";
import useReducedMotion from "./useReducedMotion";

/*
 * State for a timed carousel. Autoplay starts on unless the user prefers reduced motion,
 * and `running` is only true while the carousel is on screen and the tab is visible,
 * mirroring how Apple's gallery pauses itself off-screen.
 */
const useCarousel = (count, { inView = true } = {}) => {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(!reduced);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (reduced) setPlaying(false);
  }, [reduced]);

  useEffect(() => {
    if (index >= count && count > 0) setIndex(0);
  }, [count, index]);

  const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count]);
  const prev = useCallback(() => setIndex((i) => (count ? (i - 1 + count) % count : 0)), [count]);
  const togglePlay = useCallback(() => setPlaying((p) => !p), []);

  return { index, setIndex, next, prev, playing, togglePlay, running: playing && inView && tabVisible };
};

export default useCarousel;
