import { isIP } from "node:net";
import { DEFAULT_ALLOWED_HOSTS } from "./server.config.ts";

const IPV6_BRACKETS = /^\[(.*)\]$/;
const LABEL_SEPARATOR = ".";

/** The lowercase hostname of a Host header (port stripped, IPv6 brackets removed), or undefined if malformed. */
export function hostnameOf(hostHeader: string | undefined): string | undefined {
  if (!hostHeader) return undefined;
  try {
    const { hostname } = new URL(`http://${hostHeader}`);
    return hostname.replace(IPV6_BRACKETS, "$1").toLowerCase();
  } catch {
    return undefined;
  }
}

function matches(hostname: string, entry: string): boolean {
  return entry.startsWith(".")
    ? hostname.endsWith(entry) || hostname === entry.slice(1)
    : hostname === entry;
}

/** A name with no dot is resolved by the local network (hosts file, search domain, Docker DNS), never public DNS. */
function isSingleLabel(hostname: string): boolean {
  return !hostname.includes(LABEL_SEPARATOR);
}

/**
 * Whether a request's Host header names this server. Without it, a web page can
 * DNS-rebind its own domain to the server's address and become same-origin with it,
 * defeating the Origin check. IP literals and single-label names can't be rebound
 * from the internet, so they always pass.
 */
export function isAllowedHost(
  hostHeader: string | undefined,
  extraAllowed: readonly string[],
): boolean {
  const hostname = hostnameOf(hostHeader);
  if (!hostname) return false;
  if (isIP(hostname) !== 0 || isSingleLabel(hostname)) return true;
  return [...DEFAULT_ALLOWED_HOSTS, ...extraAllowed].some((entry) => matches(hostname, entry));
}
