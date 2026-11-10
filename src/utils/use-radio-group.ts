import { useRef, type KeyboardEvent } from "react";
import { nextRadioIndex } from "./radio-group.ts";

type RadioGroup = {
  readonly register: (index: number) => (element: HTMLElement | null) => void;
  readonly tabIndexFor: (index: number) => 0 | -1;
  readonly onKeyDown: (event: KeyboardEvent, index: number) => void;
};

/**
 * Roving-tabindex radio behaviour: one tab stop on the selected option, arrows/Home/End move
 * focus and select, like native radios.
 */
export function useRadioGroup<T extends string>(
  ids: readonly T[],
  value: T,
  onChange: (id: T) => void,
): RadioGroup {
  const elements = useRef<(HTMLElement | null)[]>([]);
  const selectedIndex = Math.max(0, ids.indexOf(value));
  return {
    register: (index) => (element) => {
      elements.current[index] = element;
    },
    tabIndexFor: (index) => (index === selectedIndex ? 0 : -1),
    onKeyDown: (event, index) => {
      const next = nextRadioIndex(event.key, index, ids.length);
      const id = next === null ? undefined : ids[next];
      if (next === null || id === undefined) return;
      event.preventDefault();
      onChange(id);
      elements.current[next]?.focus();
    },
  };
}
