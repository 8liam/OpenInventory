import { useLayoutEffect, useState, type RefObject } from "react";
import type { ScrollArea } from "./use-scroll-area.types";

function measure(element: HTMLElement): ScrollArea {
  // The element has no border of its own, so what offsetWidth adds over clientWidth is scrollbar.
  return { width: element.clientWidth, gutter: element.offsetWidth - element.clientWidth };
}

/**
 * A scroll container's usable width (inside its vertical scrollbar) and the scrollbar's width,
 * kept current with a ResizeObserver. `undefined` until measured after mount, so a server render
 * and the first client render agree.
 */
export function useScrollArea(ref: RefObject<HTMLElement | null>): ScrollArea | undefined {
  const [area, setArea] = useState<ScrollArea>();
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const update = () =>
      setArea((current) => {
        const next = measure(element);
        return current?.width === next.width && current.gutter === next.gutter ? current : next;
      });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return area;
}
