import { TRANSFER_BAR } from "~/components/transfer-bar/transfer-bar.config";
import { TRANSFER_STATUS } from "~/components/transfer-status/transfer-status.config";
import { UNIT_NAME } from "~/components/unit-name/unit-name.config";
import { COPY } from "~/lib/copy/copy.config";
import { MARKETPLACES } from "~/lib/settings/settings.config";
import { STORAGE_LIMITS } from "~/lib/storage/storage.config";
import type { BentoCard, BentoPlatform } from "./bento.types";

/**
 * Sample prices one item would show on each marketplace. Buff163 is the app's default and matches the
 * sample account used everywhere else on the page; the rest are plausible stand-ins, labelled as samples.
 */
const SAMPLE_PRICES: Readonly<Record<(typeof MARKETPLACES)[number], number>> = {
  buff163: 1062.86,
  csfloat: 1118.34,
  csmoney: 1203.7,
  youpin: 1049.15,
  lisskins: 1087.92,
  skinport: 1141.6,
  steam: 1389.25,
};
const DEFAULT_MARKET_ID = "buff163";

/** Default first, so the static frame and the first frame of the cycle agree. */
const ORDERED_MARKETS = [
  DEFAULT_MARKET_ID,
  ...MARKETPLACES.filter((id) => id !== DEFAULT_MARKET_ID),
] as const;

export const bento = {
  id: "bento",
  eyebrow: "Small on purpose",
  heading: "Everything your inventory needs,",
  accent: "nothing it doesn’t.",
  /** Seconds between neighbouring cards when they reveal. */
  stagger: 0.08,
  /** Cards per visual row, so the stagger restarts on each row. */
  staggerColumns: 3,
  cards: [
    {
      kind: "prices",
      eyebrow: "Your market, your value",
      title: "Seven price sources. Your pick.",
      body: "Choose where prices come from in Settings. Buff163 is the default.",
    },
    {
      kind: "local",
      eyebrow: "Self-hosted by design",
      title: "One SQLite file. All yours.",
      body: "Your inventory and value history stay cached on your own machine. One Docker command starts it.",
    },
    {
      kind: "capacity",
      eyebrow: "A little room to grow",
      title: "Know what fits.",
      body: "Each storage unit’s 1,000-item capacity is checked before a move begins.",
    },
    {
      kind: "signin",
      eyebrow: "Scan. Confirm. You’re in.",
      title: "Your phone is the key.",
      body: "Scan the QR code in the Steam mobile app. No Steam password stored.",
    },
    {
      kind: "readonly",
      eyebrow: "Look with confidence",
      title: "Never lists, sells or trades.",
      body: "Read-only apart from item moves, storage-unit renames and Terminal actions.",
    },
    {
      kind: "platforms",
      eyebrow: "Make yourself at home",
      title: "Your desktop. Or your browser.",
      body: "Desktop apps for macOS, Windows and Linux, or a self-hosted web app you start with Docker.",
    },
  ] as const satisfies readonly BentoCard[],

  /** Settings > Pricing, in the app's own words. */
  prices: {
    section: COPY.settings.pricing.title,
    currency: {
      label: COPY.settings.pricing.currency,
      hint: COPY.settings.pricing.currencyHint,
      value: "USD",
    },
    marketplace: {
      label: COPY.settings.pricing.marketplace,
      hint: COPY.settings.pricing.marketplaceHint,
    },
    markets: ORDERED_MARKETS.map((id) => ({
      id,
      label: COPY.settings.marketplaces[id],
      price: SAMPLE_PRICES[id],
    })),
    /** The item whose price ticks as the marketplace changes. */
    itemName: "★ Butterfly Knife | Vanilla",
    sampleTag: "Sample prices",
    currencyCode: "USD",
    caption: COPY.dashboard.pricesFrom,
  },

  /** Docker start-up, with the server's real ready line. */
  local: {
    shellPrompt: "$",
    command: "docker compose up -d",
    /** The line server/index.ts logs when it is ready. */
    output: "[openinventory] listening on http://0.0.0.0:3000 (data: /data)",
    dbPath: "/data/openinventory.db",
    dbKind: "SQLite",
    caption: "Stored on your machine",
    /** Items whose thumbnails load in, in order. */
    thumbItems: [
      "★ Butterfly Knife | Vanilla",
      "★ Karambit | Slaughter (Factory New)",
      "★ Sport Gloves | Nocts (Field-Tested)",
      "Tec-9 | Whiteout (Factory New)",
      "M4A1-S | Control Panel (Factory New)",
      "AK-47 | Inheritance (Factory New)",
      "Glock-18 | Gamma Doppler (Factory New)",
    ],
  },

  /** The Steam QR sign-in, using the login card's own strings. */
  signin: {
    title: COPY.signIn.title,
    body: COPY.signIn.body,
    button: COPY.signIn.button,
    waiting: COPY.signIn.waiting,
    connected: COPY.accounts.status.ready,
    qrLabel: COPY.signIn.qrLabel,
  },

  /** A unit-to-unit move on the sample account, drawn with the transfer bar and unit cards. */
  capacity: {
    capacity: STORAGE_LIMITS.unitCapacity,
    fromUnit: "skins",
    toUnit: "random",
    itemName: "Glock-18 | Shinobu (Factory New)",
    itemsWord: COPY.storage.items,
    renameLabel: UNIT_NAME.editLabel,
    bar: {
      selected: TRANSFER_BAR.selectedLabel(1),
      clear: TRANSFER_BAR.clear,
      destination: TRANSFER_BAR.destination,
      move: TRANSFER_BAR.move,
      confirm: TRANSFER_BAR.confirm,
      confirmButton: TRANSFER_BAR.confirmButton,
      back: TRANSFER_BAR.back,
      running: TRANSFER_STATUS.running,
      finished: TRANSFER_STATUS.finished,
      cancel: TRANSFER_STATUS.cancel,
      dismiss: TRANSFER_STATUS.dismiss,
    },
  },

  /** What the app allows on an item row, and what it will never do. */
  readonly: {
    columns: COPY.itemColumns,
    rowItems: ["★ Butterfly Knife | Vanilla", "★ Karambit | Slaughter (Factory New)"],
    unitName: "Trade stock",
    renameLabel: UNIT_NAME.editLabel,
    move: TRANSFER_BAR.move,
    denied: ["List", "Sell", "Trade"],
    lockLabel: "Read-only",
  },

  platforms: {
    desktopTitle: "OpenInventory",
    browserUrl: "localhost:3000",
    webLabel: "Web, with Docker",
    imageAlt: "",
    /** Widths the dashboard screenshot is optimised to; the frames never show it wider than ~720px. */
    imageWidths: [480, 720, 1080],
    imageSizes: "(min-width: 700px) 22rem, 80vw",
    items: [
      { name: "macOS", file: ".dmg" },
      { name: "Windows", file: ".exe" },
      { name: "Linux", file: ".AppImage" },
    ] as const satisfies readonly BentoPlatform[],
  },
} as const;
