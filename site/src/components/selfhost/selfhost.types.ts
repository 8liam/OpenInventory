export type SelfhostTokenKind =
  | "command"
  | "subcommand"
  | "flag"
  | "arg"
  | "key"
  | "value"
  | "plain";

export type SelfhostToken = {
  readonly kind: SelfhostTokenKind;
  readonly text: string;
};

export type SelfhostPreviewKind = "yaml" | "plain";

export type SelfhostLink = {
  readonly label: string;
  readonly href: string;
};

export type SelfhostTab = {
  readonly id: string;
  readonly label: string;
  readonly note: string;
  readonly command?: string;
  readonly preview?: { readonly kind: SelfhostPreviewKind; readonly lines: readonly string[] };
  readonly output?: string;
  readonly link?: SelfhostLink;
};

export type SelfhostTrustPoint = {
  readonly title: string;
  readonly body: string;
};

export type SelfhostCopy = {
  readonly id: string;
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly trust: readonly SelfhostTrustPoint[];
  readonly terminalTitle: string;
  readonly tabsLabel: string;
  readonly outputLabel: string;
  readonly copy: string;
  readonly copied: string;
  readonly copySuffix: string;
  readonly copyError: string;
  readonly source: SelfhostLink;
  readonly tabs: readonly SelfhostTab[];
};
