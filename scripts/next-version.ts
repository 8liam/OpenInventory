// Prints the next release version (without the tag prefix) from the commits since the last tag.
import { execFileSync } from "node:child_process";
import {
  BUMP,
  INITIAL_VERSION,
  MINOR_TYPES,
  RELEASE_EXCLUDED_PATHSPECS,
  TAG_PREFIX,
} from "./release.config.ts";
import type { Bump } from "./release.types.ts";

const COMMIT_PATTERN = /^(\w+)(?:\([^)]*\))?(!)?:/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE:/m;
const COMMIT_SEPARATOR = "\u001e";

function git(...args: string[]): string {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function lastTag(): string | undefined {
  try {
    return git("describe", "--tags", "--abbrev=0", "--match", `${TAG_PREFIX}*`);
  } catch {
    return undefined;
  }
}

function commitsSince(tag: string): string[] {
  const out = git(
    "log",
    "--no-merges",
    `--format=%B${COMMIT_SEPARATOR}`,
    `${tag}..HEAD`,
    "--",
    ".",
    ...RELEASE_EXCLUDED_PATHSPECS,
  );
  return out
    .split(COMMIT_SEPARATOR)
    .map((c) => c.trim())
    .filter(Boolean);
}

function bumpFor(commits: readonly string[]): Bump {
  let bump: Bump = BUMP.patch;
  for (const message of commits) {
    const match = COMMIT_PATTERN.exec(message);
    if (match?.[2] || BREAKING_FOOTER.test(message)) return BUMP.major;
    if (match?.[1] && MINOR_TYPES.includes(match[1])) bump = BUMP.minor;
  }
  return bump;
}

function increment(version: string, bump: Bump): string {
  const [major = 0, minor = 0, patch = 0] = version.split(".").map(Number);
  if (bump === BUMP.major) return `${major + 1}.0.0`;
  if (bump === BUMP.minor) return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const tag = lastTag();
if (!tag) {
  console.log(INITIAL_VERSION);
} else {
  const commits = commitsSince(tag);
  if (commits.length === 0) throw new Error(`No commits since ${tag}; nothing to release`);
  console.log(increment(tag.slice(TAG_PREFIX.length), bumpFor(commits)));
}
