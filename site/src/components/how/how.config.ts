import { TRANSFER_BAR } from '~/components/transfer-bar/transfer-bar.config';
import { COPY } from '~/lib/copy/copy.config';
import { STORAGE_LIMITS } from '~/lib/storage/storage.config';
import { TRANSFER_STATUS } from '~/components/transfer-status/transfer-status.config';

/** Copy that comes straight from the app is imported, so the landing page can never drift from the UI. */
export const howConfig = {
  eyebrow: 'How it works',
  staggerSeconds: 0.08,
  numberWidth: 2,
  currency: 'USD',
  locale: 'en-US',

  login: {
    title: COPY.signIn.title,
    /** First sentence of the app's sign-in body; the full paragraph does not fit a card. */
    lead: 'Scan the code with the Steam mobile app.',
    button: COPY.signIn.button,
    waiting: COPY.signIn.waiting,
    connected: COPY.accounts.status.ready,
    qrLabel: 'Steam sign-in QR code',
  },

  value: {
    label: COPY.dashboard.totalValue,
    changeWindow: COPY.dashboard.change.day,
    /** The only copy that is new: the app has no label for the file it writes to. */
    saved: 'Saved to SQLite',
    chartLabel: COPY.dashboard.historyTitle,
  },

  move: {
    fromId: 'skins',
    toId: 'investments',
    thumbsPerUnit: 4,
    selected: TRANSFER_BAR.selectedLabel(1),
    clear: TRANSFER_BAR.clear,
    move: TRANSFER_BAR.move,
    unitCapacity: STORAGE_LIMITS.unitCapacity,
    moving: (from: string, to: string): string => TRANSFER_STATUS.running(0, 1, from, to),
    moved: (to: string): string => TRANSFER_STATUS.finished(1, 1, to),
  },

  chart: {
    width: 300,
    height: 92,
    padTop: 10,
    padBottom: 8,
    padRight: 7,
    padLeft: 7,
    /** Points drawn: every `stride`th hourly snapshot across the last 24 hours, ending on the live value. */
    windowPoints: 13,
    stride: 2,
    /** One dot per this many snapshots, so the line stays readable at card size. */
    dotEvery: 2,
    dotSpacing: 14,
    dotRadius: 0.9,
    pointRadius: 2.6,
    strokeWidth: 2,
  },

  qr: {
    size: 25,
    seed: 4021,
    finder: 7,
    alignmentAt: 16,
    alignmentSize: 5,
    timingAt: 6,
    fill: 0.5,
  },

  motion: {
    selector: '[data-how]',
    cardSelector: '.how__card',
    /** Ratio of the illustration that must be on screen before its story plays. */
    visibleRatio: 0.55,
    /** Cards on the same row start a beat apart. */
    staggerMs: 140,
    /** Must match each illustration's keyframe length in how.css (--how-dur). */
    durationsMs: [5200, 4600, 5600],
    reducedMotionQuery: '(prefers-reduced-motion: reduce)',
  },
} as const;
