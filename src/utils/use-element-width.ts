import { useLayoutEffect, useState, type RefObject } from "react";

/**
 * The element's content-box width in px, kept current with a ResizeObserver. It is `undefined`
 * until measured after mount, so a server render and the first client render agree.
 */
export function useElementWidth(ref: RefObject<HTMLElement | null>): number | undefined {
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    setWidth(element.clientWidth);
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}
