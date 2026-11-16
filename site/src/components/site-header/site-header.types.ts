export type HeaderLink = {
  readonly label: string;
  readonly href: string;
};

export type HeaderConfig = {
  readonly links: readonly HeaderLink[];
  readonly github: string;
  readonly selfHost: HeaderLink;
  readonly download: HeaderLink;
  readonly menu: { readonly open: string; readonly close: string };
  readonly navigation: string;
  /** Must mirror the `max-width` breakpoint in sections/header.css. */
  readonly mobileQuery: string;
};
