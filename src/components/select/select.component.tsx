import { Check, ChevronsUpDown, Search } from "lucide-react";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { cn } from "~/utils/cn";
import { SELECT } from "./select.config";
import type { SelectOption, SelectPlacement, SelectProps } from "./select.types";

function placementFor(trigger: HTMLElement, minWidth: number): SelectPlacement {
  const rect = trigger.getBoundingClientRect();
  const below = window.innerHeight - rect.bottom - SELECT.viewportMargin - SELECT.gap;
  const above = rect.top - SELECT.viewportMargin - SELECT.gap;
  const openUp = below < SELECT.maxListHeight && above > below;
  const maxHeight = Math.min(SELECT.maxListHeight, openUp ? above : below);
  const width = Math.min(
    Math.max(rect.width, minWidth),
    window.innerWidth - SELECT.viewportMargin * 2,
  );
  const left = Math.min(rect.left, window.innerWidth - width - SELECT.viewportMargin);
  return openUp
    ? { left, width, bottom: window.innerHeight - rect.top + SELECT.gap, maxHeight }
    : { left, width, top: rect.bottom + SELECT.gap, maxHeight };
}

/** The app's one dropdown: a styled trigger and list, with search once the list is long. */
export function Select({
  value,
  options,
  onChange,
  ariaLabel,
  disabled,
  className,
  listMinWidth = SELECT.minListWidth,
  describedBy,
}: SelectProps) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [placement, setPlacement] = useState<SelectPlacement>();

  const searchable = options.length > SELECT.searchThreshold;
  const selected = options.find((option) => option.id === value);
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? options.filter((option) =>
          [option.label, option.detail, option.hint, option.triggerDetail].some((text) =>
            text?.toLowerCase().includes(needle),
          ),
        )
      : options;
  }, [options, query]);

  function show() {
    if (disabled || !trigger.current) return;
    setPlacement(placementFor(trigger.current, listMinWidth));
    setQuery("");
    setHighlight(
      Math.max(
        0,
        options.findIndex((option) => option.id === value),
      ),
    );
    setOpen(true);
  }

  function hide(refocus: boolean) {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  }

  function choose(option: SelectOption | undefined) {
    if (!option || option.disabled) return;
    onChange(option.id);
    hide(true);
  }

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target instanceof Node && root.current?.contains(event.target))) hide(false);
    };
    const onResize = () => hide(false);
    // Opening scrolls the highlighted row into view, which fires scroll events inside the list;
    // only a scroll of something holding the trigger leaves the list in the wrong place.
    const onScroll = (event: Event) => {
      const target = event.target;
      if (target === document || (target instanceof Node && target.contains(root.current)))
        hide(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) (searchable ? search.current : list.current)?.focus();
  }, [open, searchable]);

  useEffect(() => {
    if (open) document.getElementById(`${id}-${highlight}`)?.scrollIntoView({ block: "nearest" });
  }, [open, highlight, id]);

  function onListKeyDown(event: KeyboardEvent) {
    // Tab keeps its default move; the list just closes so it never floats over the next control.
    if (event.key === SELECT.keys.leave) {
      hide(false);
      return;
    }
    const last = visible.length - 1;
    if (event.key === SELECT.keys.next) setHighlight((index) => Math.min(last, index + 1));
    else if (event.key === SELECT.keys.previous) setHighlight((index) => Math.max(0, index - 1));
    else if (event.key === SELECT.keys.home) setHighlight(0);
    else if (event.key === SELECT.keys.end) setHighlight(Math.max(0, last));
    else if (event.key === SELECT.keys.commit) choose(visible[highlight]);
    else if (event.key === SELECT.keys.close) hide(true);
    else return;
    event.preventDefault();
  }

  const popoverStyle: CSSProperties | undefined = placement && {
    left: placement.left,
    width: placement.width,
    top: placement.top,
    bottom: placement.bottom,
  };

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      onBlur={(event) => {
        // Focus moved to something outside (a click elsewhere, or assistive tech jumping away).
        const next = event.relatedTarget;
        if (open && next instanceof Node && !root.current?.contains(next)) hide(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        disabled={disabled}
        onClick={() => (open ? hide(false) : show())}
        onKeyDown={(event) => {
          if (!open && SELECT.keys.open.includes(event.key)) {
            event.preventDefault();
            show();
          }
        }}
        className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-card pl-3 pr-2 text-left text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-primary disabled:pointer-events-none disabled:opacity-50 max-sm:h-9"
      >
        <span className="flex min-w-0 items-center gap-1.5">
          {selected?.leading}
          <span className="truncate">{selected?.label ?? ""}</span>
          {selected?.triggerDetail && (
            <span className="shrink-0 text-[11px] text-muted-foreground tabular">
              {selected.triggerDetail}
            </span>
          )}
        </span>
        <ChevronsUpDown
          size={SELECT.iconSize}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
      </button>
      {open && placement && (
        <div
          style={popoverStyle}
          // Focusable, so a click on the search row's padding keeps focus inside instead of closing.
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          className="fixed z-50 flex flex-col overflow-hidden rounded-md border bg-card text-foreground shadow-lg outline-none"
        >
          {searchable && (
            <div className="flex h-9 shrink-0 items-center gap-2 border-b px-2.5">
              <Search
                size={SELECT.iconSize}
                className="shrink-0 text-muted-foreground"
                aria-hidden
              />
              <input
                ref={search}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlight(0);
                }}
                placeholder={SELECT.searchPlaceholder}
                aria-label={SELECT.searchPlaceholder}
                aria-controls={`${id}-list`}
                aria-activedescendant={visible.length > 0 ? `${id}-${highlight}` : undefined}
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <ul
            id={`${id}-list`}
            role="listbox"
            tabIndex={searchable ? -1 : 0}
            ref={list}
            aria-label={ariaLabel}
            aria-activedescendant={visible.length > 0 ? `${id}-${highlight}` : undefined}
            style={{ maxHeight: placement.maxHeight }}
            className="overflow-y-auto p-1 outline-none"
          >
            {visible.map((option, index) => (
              <li
                key={option.id}
                id={`${id}-${index}`}
                role="option"
                aria-selected={option.id === value}
                aria-disabled={option.disabled}
                onMouseMove={() => setHighlight(index)}
                onClick={() => choose(option)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded px-2 py-1.5",
                  index === highlight && "bg-muted",
                  option.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <Check
                  size={SELECT.iconSize}
                  className={cn("shrink-0", option.id !== value && "invisible")}
                  aria-hidden
                />
                {option.leading}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{option.label}</span>
                  {option.hint && (
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.hint}
                    </span>
                  )}
                </span>
                {option.detail && (
                  <span className="shrink-0 text-xs text-muted-foreground tabular">
                    {option.detail}
                  </span>
                )}
              </li>
            ))}
            {visible.length === 0 && (
              <li className="px-2 py-1.5 text-muted-foreground">{SELECT.noMatches}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
