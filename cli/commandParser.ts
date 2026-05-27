export type ParsedCommand =
  | {
      kind: "empty";
    }
  | {
      kind: "write";
      path?: string;
      content?: string;
    }
  | {
      kind: "command";
      name: string;
      args: string[];
    };

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim();

  if (trimmed.length === 0) {
    return { kind: "empty" };
  }

  const firstWhitespace = trimmed.search(/\s/);
  const name = firstWhitespace === -1 ? trimmed : trimmed.slice(0, firstWhitespace);

  if (name === "write") {
    const rest = firstWhitespace === -1 ? "" : trimmed.slice(firstWhitespace).trimStart();
    const pathEnd = rest.search(/\s/);

    if (rest.length === 0) {
      return { kind: "write" };
    }

    if (pathEnd === -1) {
      return { kind: "write", path: rest };
    }

    return {
      kind: "write",
      path: rest.slice(0, pathEnd),
      content: rest.slice(pathEnd).trimStart(),
    };
  }

  const args = firstWhitespace === -1 ? [] : trimmed.slice(firstWhitespace).trim().split(/\s+/);

  return { kind: "command", name, args };
}
