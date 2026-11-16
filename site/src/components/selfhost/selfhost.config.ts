import type { SelfhostCopy } from "./selfhost.types";

/** Copy for the self-host section. Every command below comes from the repo root README.md, Dockerfile and docker-compose.yml. */
export const selfhost = {
  id: "selfhost",
  eyebrow: "Your machine. Your inventory.",
  heading: "Self-host in one command.",
  body: "From a checkout of the repo, start it with Docker, open the page and scan a QR code in the Steam mobile app. Everything is cached in a local SQLite file on your own machine.",
  trust: [
    {
      title: "Sessions stay on your box",
      body: "Your Steam refresh token is stored in sessions/<steamId>.json (mode 0600) in your own data directory.",
    },
    {
      title: "No cloud account",
      body: "Sign in with the Steam mobile app. There is no OpenInventory account and no hosted version.",
    },
    {
      title: "Read-only by default",
      body: "Apart from moving items, renaming storage units and Terminal actions, it never lists or trades anything.",
    },
  ],
  terminalTitle: "openinventory",
  tabsLabel: "Install method",
  outputLabel: "Container log",
  copy: "Copy",
  copied: "Copied",
  copySuffix: " command",
  copyError: "Could not copy. The command is selected, press Ctrl or Cmd C.",
  source: {
    label: "Setup guide on GitHub",
    href: "https://github.com/8liam/OpenInventory#run-with-docker",
  },
  tabs: [
    {
      id: "docker",
      label: "Docker",
      note: "Builds the image from source and starts it in the background. Then open localhost:3000 and press Show QR code.",
      command: "docker compose up -d",
      output: "[openinventory] listening on http://0.0.0.0:3000 (data: /data)",
    },
    {
      id: "compose",
      label: "Docker Compose",
      note: "The included docker-compose.yml keeps your data in a named volume. Set OPENINVENTORY_PASSWORD if anyone but you can reach the port.",
      preview: {
        kind: "yaml",
        lines: [
          "services:",
          "  openinventory:",
          "    build: .",
          "    image: openinventory:latest",
          "    ports:",
          '      - "3000:3000"',
          "    volumes:",
          "      - openinventory-data:/data",
        ],
      },
      command: "docker compose up -d",
    },
    {
      id: "desktop",
      label: "Desktop app",
      note: "Prefer an app? Grab the installer for your OS, open it and sign in with the Steam mobile app.",
      preview: { kind: "plain", lines: ["macOS    .dmg", "Windows  .exe", "Linux    .AppImage"] },
      link: {
        label: "Download the latest release",
        href: "https://github.com/8liam/OpenInventory/releases/latest",
      },
    },
  ],
} as const satisfies SelfhostCopy;

export const SELFHOST_FEEDBACK_MS = 2200;
export const SELFHOST_YAML_KEY = /^(\s*(?:- )?)([\w-]+):(.*)$/;
export const SELFHOST_FLAG_PREFIX = "-";
