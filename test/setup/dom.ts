import { Window } from "happy-dom";

/** Testing Library prints the DOM into failures; keep that short so reports stay readable. */
const DOM_PRINT_LIMIT = "1500";
const PAGE_URL = "http://localhost:3000/";
/** Browser globals components and Testing Library read; copied from the happy-dom window. */
const GLOBAL_KEYS = [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  "HTMLElement",
  "HTMLInputElement",
  "HTMLButtonElement",
  "HTMLTextAreaElement",
  "HTMLSelectElement",
  "HTMLFormElement",
  "HTMLAnchorElement",
  "HTMLImageElement",
  "HTMLCanvasElement",
  "HTMLDialogElement",
  "SVGElement",
  "Element",
  "Node",
  "NodeFilter",
  "Text",
  "Event",
  "CustomEvent",
  "KeyboardEvent",
  "MouseEvent",
  "PointerEvent",
  "FocusEvent",
  "InputEvent",
  "DocumentFragment",
  "MutationObserver",
  "getComputedStyle",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "matchMedia",
  "DOMParser",
  "File",
  "FileReader",
  "Blob",
  "URL",
  "URLSearchParams",
  "AbortController",
  "ShadowRoot",
] as const;

type WindowRecord = Record<string, unknown>;

/** Size every observed element reports; happy-dom has no layout, so tests get one fixed box. */
export const OBSERVED_SIZE = { width: 1280, height: 800 } as const;

class NoopObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): readonly unknown[] {
    return [];
  }
}

/**
 * Reports `OBSERVED_SIZE` as soon as an element is observed. A browser does this a frame later,
 * but components observe from effects, which run inside the test's act scope, so reporting
 * synchronously keeps every resulting update inside that scope too.
 */
class FixedSizeResizeObserver extends NoopObserver {
  private readonly callback: (entries: readonly unknown[]) => void;
  constructor(callback: (entries: readonly unknown[]) => void) {
    super();
    this.callback = callback;
  }
  override observe(target: unknown): void {
    const { width, height } = OBSERVED_SIZE;
    this.callback([
      {
        target,
        contentRect: { width, height, top: 0, left: 0, right: width, bottom: height },
        borderBoxSize: [{ inlineSize: width, blockSize: height }],
        contentBoxSize: [{ inlineSize: width, blockSize: height }],
      },
    ]);
  }
}

/** Installs a happy-dom window as the global scope. Safe to call once per process. */
export function installDom(): Window {
  process.env["DEBUG_PRINT_LIMIT"] ??= DOM_PRINT_LIMIT;
  const win = new Window({ url: PAGE_URL });
  const source = win as unknown as WindowRecord;
  const target = globalThis as unknown as WindowRecord;
  for (const key of GLOBAL_KEYS) {
    const value = source[key];
    if (value === undefined) continue;
    Object.defineProperty(target, key, {
      value: typeof value === "function" && !/^[A-Z]/.test(key) ? value.bind(win) : value,
      configurable: true,
      writable: true,
    });
  }
  win.scrollTo = (): void => {};
  target["scrollTo"] = win.scrollTo;
  Object.defineProperty(target, "self", { value: globalThis, configurable: true, writable: true });
  Object.defineProperty(target, "IS_REACT_ACT_ENVIRONMENT", {
    value: true,
    configurable: true,
    writable: true,
  });
  // happy-dom has no layout engine; the app reads these for measuring, so give them inert stand-ins.
  win.ResizeObserver = FixedSizeResizeObserver as never;
  win.IntersectionObserver ??= NoopObserver as never;
  target["ResizeObserver"] = win.ResizeObserver;
  target["IntersectionObserver"] = win.IntersectionObserver;
  for (const [name, value] of [
    ["offsetWidth", OBSERVED_SIZE.width],
    ["clientWidth", OBSERVED_SIZE.width],
    ["offsetHeight", OBSERVED_SIZE.height],
    ["clientHeight", OBSERVED_SIZE.height],
  ] as const) {
    Object.defineProperty(win.HTMLElement.prototype, name, { configurable: true, get: () => value });
  }
  win.HTMLElement.prototype.scrollIntoView = function scrollIntoView(): void {};
  return win;
}
