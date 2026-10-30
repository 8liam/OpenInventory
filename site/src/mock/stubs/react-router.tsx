import type { AnchorHTMLAttributes, ReactNode } from 'react';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { readonly to: string; readonly children?: ReactNode };

/** The demo has no router: a link is inert, so the real app's `<Link>` renders a plain anchor. */
export function Link({ to, children, ...rest }: LinkProps) {
  return (
    <a href={to} onClick={(event) => event.preventDefault()} {...rest}>
      {children}
    </a>
  );
}
