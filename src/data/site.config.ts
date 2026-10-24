import type { Chapter, ConfigPoint, ConfigRow, Stat } from './site.types';

export const site = {
  name: 'OpenInventory',
  url: 'https://openinventory-web.vercel.app',
  title: 'OpenInventory | Self-hosted CS2 inventory and storage unit tracker',
  description:
    'Track every CS2 skin, sticker and storage unit you own, with live value history. Self-hosted, one SQLite file, signed in with the Steam mobile app.',
  repo: 'https://github.com/8liam/OpenInventory',
  webRepo: 'https://github.com/8liam/openinventory-web',
  themeColor: '#0a0a0b',
  ogImage: '/og.png',
  ogAlt: 'OpenInventory dashboard showing a $4,045.19 CS2 inventory value chart',
} as const;

export const nav = [
  { label: 'Features', href: '#features' },
  { label: 'Moving items', href: '#move' },
  { label: 'Self-host', href: '#self-host' },
] as const;

export const hero = {
  headline: 'Know what you own, where it sits, and what it is worth.',
  lede: 'OpenInventory is a self-hosted tracker for your CS2 inventory and storage units. Sign in once with the Steam mobile app and it keeps the history for you.',
  ledeLead: 'OpenInventory is a self-hosted tracker',
  primary: { label: 'Run with Docker', href: '#self-host' },
  secondary: { label: 'View on GitHub', href: site.repo },
  readout: {
    label: 'Sample inventory, total value',
    value: 4045.19,
    parts: [
      { label: 'Inventory', value: '$3,681.03' },
      { label: 'Storage units', value: '$364.16' },
      { label: 'Items', value: '1,675' },
    ],
  },
  screenshotAlt:
    'OpenInventory dashboard: total value of $4,045.19, a value history chart, top holdings and a breakdown by type.',
} as const;

export const story = {
  id: 'features',
  heading: 'Five views of one ledger.',
  note: 'Not screenshots. This is the app itself, running on a sample account in your browser. Click, sort, search and move things around; nothing leaves the page.',
  chapters: [
    {
      id: 'dashboard',
      hint: 'Hover the chart. Switch the range.',
      figure: { label: 'Total value', value: 4045.19, prefix: '$', suffix: '', decimals: 2 },
      view: 'Dashboard',
      route: '/dashboard',
      title: 'A value you can watch move.',
      body: 'Total value with 24h, 7d and 30d change. Switch the history chart between total, inventory and storage units, from one day to all time.',
      points: ['Breakdown by type, rarity, wear and location', 'Lowest floats, highest floats and largest stacks'],
    },
    {
      id: 'items',
      hint: 'Search, filter and select rows.',
      figure: { label: 'Items on the sample account', value: 1675, prefix: '', suffix: '', decimals: 0 },
      view: 'Items',
      route: '/items',
      title: 'One search box over every item.',
      body: 'Inventory and every storage unit in a single table, with images, floats, stickers, charms with pattern ids, and prices.',
      points: ['Filter by location and type', 'Sort by float or price'],
    },
    {
      id: 'storage',
      hint: 'Pick a unit.',
      figure: { label: 'Value in 4 storage units', value: 364.16, prefix: '$', suffix: '', decimals: 2 },
      view: 'Storage units',
      route: '/storage-units',
      title: 'Open every unit without launching CS2.',
      body: 'All units load on their own and their contents are cached, so a restart is instant. Capacity of 1,000 items is checked before a move begins.',
      points: ['Per-unit value and item count', 'Contents copied from the Game Coordinator'],
    },
    {
      id: 'cases',
      hint: 'Switch the kind.',
      figure: { label: 'Cases opened', value: 412, prefix: '', suffix: '', decimals: 0 },
      view: 'Cases',
      route: '/cases',
      title: 'Your gold drought, in numbers.',
      body: 'Case, souvenir, capsule, trade-up and drop stats read from your Steam inventory history, stored locally after a background sync.',
      points: ['Rarity split and rarest pulls', 'Most opened and per-month volume'],
    },
    {
      id: 'tradeup',
      hint: 'Swap the inputs.',
      figure: { label: 'Expected return', value: -20.03, prefix: '', suffix: '%', decimals: 2 },
      view: 'Trade-up',
      route: '/trade-up',
      title: 'Do the math before you trade up.',
      body: 'A read-only estimate of expected value from your cheapest tradable skins and their collections. OpenInventory cannot perform trade-ups.',
      points: ['Input cost, average float, expected return', 'Chance to profit and every possible outcome'],
    },
  ] satisfies readonly Chapter[],
} as const;

export const numbers = {
  heading: 'Small on purpose.',
  stats: [
    { value: '1', label: 'SQLite file', note: 'Items, value history and your Steam session live in one volume you own.' },
    { value: '7', label: 'price sources', note: 'Buff163 by default. Skinport, Steam, CSFloat, CS.MONEY, Youpin898 and LIS-SKINS in Settings.' },
    { value: '1,000', label: 'items per unit', note: 'The storage unit cap, checked before a move starts rather than after it fails.' },
    { value: '0', label: 'listings or trades', note: 'It reads and moves items between your own containers. It never sells.' },
  ] satisfies readonly Stat[],
} as const;

export const move = {
  id: 'move',
  heading: 'Move items. List nothing.',
  body: 'Select items on the Items or Storage page and move them between your inventory and storage units. Unit to unit goes through your inventory.',
  steps: [
    { title: 'Select', body: 'Tick the rows. The capacity check runs before anything moves.' },
    { title: 'Confirm', body: 'Each move is confirmed by the Game Coordinator, with live progress and a cancel button.' },
    { title: 'Review', body: 'A per-item error report shows exactly what did not move, and why.' },
  ],
  caveat:
    'Steam allows one game session per account. If CS2 is already running, OpenInventory waits and connects when you close it. It never forces the session.',
} as const;

export const selfHost = {
  id: 'self-host',
  heading: 'Running in one command.',
  body: 'Start the container, open port 3000, press Show QR code and scan it in the Steam mobile app.',
  command: 'docker compose up -d',
  passwordCommand: "OPENINVENTORY_PASSWORD='something-long' docker compose up -d",
  passwordNote: 'Set a password if anyone but you can reach the port. The browser asks for any username plus this password.',
  configHeading: 'Configuration',
  config: [
    { name: 'OPENINVENTORY_PASSWORD', fallback: 'unset', purpose: 'Require HTTP basic auth. Unset means no auth.' },
    { name: 'OPENINVENTORY_PORT', fallback: '3000 in Docker', purpose: 'Listen port.' },
    { name: 'OPENINVENTORY_HOST', fallback: '0.0.0.0 in Docker', purpose: 'Listen address.' },
    { name: 'OPENINVENTORY_DATA_DIR', fallback: '/data in Docker', purpose: 'SQLite database and Steam session.' },
  ] satisfies readonly ConfigRow[],
  security: [
    {
      title: 'Your refresh token stays on your server.',
      body: 'It is stored in session.json with mode 0600 and deleted when you press Sign out. Protect the volume.',
    },
    {
      title: 'Without a password, reachable means movable.',
      body: 'Anyone who can reach the port can see your inventory and move your items. Use a VPN or a TLS reverse proxy.',
    },
    {
      title: 'Other sites cannot drive it.',
      body: 'State-changing requests are same-origin only and need a JSON body.',
    },
  ] satisfies readonly ConfigPoint[],
  copy: { idle: 'Copy', done: 'Copied' },
} as const;

export const footer = {
  wordmark: 'OpenInventory',
  cta: 'Read the source',
  links: [
    { label: 'OpenInventory on GitHub', href: site.repo },
    { label: 'This site on GitHub', href: site.webRepo },
    { label: 'Item data: ByMykel/CSGO-API', href: 'https://github.com/ByMykel/CSGO-API' },
    { label: 'Prices: CSGOTrader', href: 'https://prices.csgotrader.app' },
  ],
  legal: 'OpenInventory is not affiliated with or endorsed by Valve, Steam or Skinport. The demo runs on a sample account.',
} as const;
