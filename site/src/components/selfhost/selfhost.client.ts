import { selfhost, SELFHOST_FEEDBACK_MS } from "./selfhost.config";

const ATTR = {
  root: "data-selfhost",
  tabs: "[data-selfhost-tabs]",
  tab: "[data-selfhost-tab]",
  panel: "[data-selfhost-panel]",
  copy: "[data-selfhost-copy]",
  label: "[data-selfhost-copy-label]",
  status: "[data-selfhost-status]",
  code: "[data-selfhost-code]",
} as const;

function selectNode(node: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function bindCopy(panel: HTMLElement): void {
  const button = panel.querySelector<HTMLButtonElement>(ATTR.copy);
  const label = panel.querySelector<HTMLElement>(ATTR.label);
  const status = panel.querySelector<HTMLElement>(ATTR.status);
  const code = panel.querySelector<HTMLElement>(ATTR.code);
  const command = button?.dataset.command;
  if (!button || !label || !status || !code || !command) return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  button.hidden = false;
  button.addEventListener("click", async () => {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(command);
      label.textContent = selfhost.copied;
      status.textContent = selfhost.copied;
      button.dataset.state = "copied";
    } catch {
      selectNode(code);
      status.textContent = selfhost.copyError;
    }
    timer = setTimeout(() => {
      label.textContent = selfhost.copy;
      status.textContent = "";
      delete button.dataset.state;
    }, SELFHOST_FEEDBACK_MS);
  });
}

function enhance(root: HTMLElement): void {
  if (root.dataset.enhanced) return;
  const tablist = root.querySelector<HTMLElement>(ATTR.tabs);
  const tabs = [...root.querySelectorAll<HTMLButtonElement>(ATTR.tab)];
  const panels = [...root.querySelectorAll<HTMLElement>(ATTR.panel)];
  if (!tablist || !tabs.length || tabs.length !== panels.length) return;

  const activate = (index: number): void => {
    tabs.forEach((tab, i) => {
      const on = i === index;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
      panels[i].toggleAttribute("data-active", on);
    });
  };

  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    panels[index].setAttribute("role", "tabpanel");
    panels[index].setAttribute("aria-labelledby", tab.id);
    tab.addEventListener("click", () => activate(index));
    tab.addEventListener("keydown", (event) => {
      const last = tabs.length - 1;
      const targets: Record<string, number> = {
        ArrowRight: index === last ? 0 : index + 1,
        ArrowLeft: index === 0 ? last : index - 1,
        Home: 0,
        End: last,
      };
      const next = targets[event.key];
      if (next === undefined) return;
      event.preventDefault();
      activate(next);
      tabs[next].focus();
    });
  });
  panels.forEach(bindCopy);
  tablist.setAttribute("role", "tablist");
  activate(0);
  root.dataset.enhanced = "true";
}

export function initSelfhost(): void {
  document.querySelectorAll<HTMLElement>(`[${ATTR.root}]`).forEach(enhance);
}
