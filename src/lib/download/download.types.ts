import type { ICON_PATHS } from './download.icons';

export type PlatformId = 'mac-arm64' | 'mac-x64' | 'win-x64' | 'linux-x64';

export type IconName = keyof typeof ICON_PATHS;

export type PlatformSpec = {
  id: PlatformId;
  /** Shown as "Download for {label}". */
  label: string;
  /** Short label for the alternate-platform list. */
  short: string;
  icon: IconName;
  /** Matches the release asset name for this platform. */
  asset: RegExp;
};

export type PlatformLink = {
  id: PlatformId;
  label: string;
  short: string;
  icon: IconName;
  href: string;
};

export type ReleaseAsset = { name: string; browser_download_url: string };

export type ReleaseInfo = {
  tag: string;
  links: PlatformLink[];
};

/** Platform ids as seen by the browser; `null` means no desktop build applies. */
export type DetectedPlatform = PlatformId | null;
