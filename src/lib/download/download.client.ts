import { COPY, RELEASE_API, PLATFORMS } from './download.config';
import { detectPlatform } from './download.detect';
import { parseRelease } from './download.releases';

const SEL = {
  button: '[data-dl]',
  label: '[data-dl-label]',
  icon: '[data-dl-icon]',
  alt: '[data-dl-alt]',
} as const;

/** Points every download link at the newest release, so the page never serves a stale version after a publish. */
async function refreshLinks(): Promise<void> {
  try {
    const res = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) return;
    const { links } = parseRelease(await res.json());
    document.querySelectorAll<HTMLAnchorElement>(SEL.alt).forEach((a) => {
      const href = links.find((l) => l.id === a.dataset.dlAlt)?.href;
      if (href) a.href = href;
    });
  } catch { /* the build-time links stay in place */ }
}

export async function initDownload(): Promise<void> {
  const button = document.querySelector<HTMLAnchorElement>(SEL.button);
  if (!button) return;
  void refreshLinks();
  const id = await detectPlatform();
  const spec = PLATFORMS.find((p) => p.id === id);
  const alt = document.querySelector<HTMLAnchorElement>(`[data-dl-alt="${id}"]`);
  if (!spec || !alt) return;
  const label = COPY.buttonLabel(spec.label);
  button.href = alt.href;
  button.dataset.dlPlatform = spec.id;
  const text = button.querySelector<HTMLElement>(SEL.label);
  if (text) { text.textContent = label; text.dataset.text = label; }
  button.querySelectorAll<HTMLElement>(SEL.icon).forEach((el) => { el.toggleAttribute('hidden', el.dataset.dlIcon !== spec.icon); });
  alt.setAttribute('aria-current', 'true');
}
