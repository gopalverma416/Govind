import { useEffect, useState } from "react";

/*
 * Tracks whether an element is on screen. With `once`, it stays true after the first reveal.
 * Returns a callback ref so it still attaches to elements that render after the first pass.
 */
const useInView = ({ once = false, threshold = 0.15, rootMargin = "0px" } = {}) => {
  const [node, setNode] = useState(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!node) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, once, threshold, rootMargin]);

  return [setNode, inView];
};

export default useInView;
