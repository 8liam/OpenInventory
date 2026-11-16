import { SELFHOST_FLAG_PREFIX, SELFHOST_YAML_KEY } from "./selfhost.config";
import type { SelfhostToken } from "./selfhost.types";

/** Colours a shell command: program, subcommand, flags, everything else. */
export function tokenizeCommand(command: string): SelfhostToken[] {
  return command.split(" ").map((text, index): SelfhostToken => {
    if (index === 0) return { kind: "command", text };
    if (text.startsWith(SELFHOST_FLAG_PREFIX)) return { kind: "flag", text };
    return { kind: index === 1 ? "subcommand" : "arg", text };
  });
}

/** Splits one YAML line into indent, key and value so the key can be tinted. */
export function tokenizeYamlLine(line: string): SelfhostToken[] {
  const match = SELFHOST_YAML_KEY.exec(line);
  if (!match) return [{ kind: "value", text: line }];
  const [, indent, key, rest] = match;
  return [
    { kind: "plain", text: indent },
    { kind: "key", text: `${key}:` },
    { kind: "value", text: rest },
  ];
}
