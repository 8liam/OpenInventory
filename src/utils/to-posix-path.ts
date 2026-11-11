const WINDOWS_SEPARATOR = "\\";
const POSIX_SEPARATOR = "/";

/** Rewrites Windows separators to forward slashes, so `relative()` output matches on every OS. */
export function toPosixPath(path: string): string {
  return path.replaceAll(WINDOWS_SEPARATOR, POSIX_SEPARATOR);
}
