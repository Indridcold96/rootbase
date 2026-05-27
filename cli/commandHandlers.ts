import { FileSystemError, InMemoryFileSystem } from "../core/filesystem";
import type { ParsedCommand } from "./commandParser";
import { formatEntries, formatSearchResults, formatTree, HELP_TEXT } from "./formatters";

export interface CliState {
  fs: InMemoryFileSystem;
}

export interface CommandResult {
  output: string;
  shouldExit: boolean;
}

type CliCommandHandler = {
  usage: string;
  execute: (state: CliState, args: string[]) => CommandResult;
};

export function createCliState(): CliState {
  return {
    fs: new InMemoryFileSystem(),
  };
}

export function executeCommand(state: CliState, command: ParsedCommand): CommandResult {
  if (command.kind === "empty") {
    return stay("");
  }

  try {
    if (command.kind === "write") {
      return handleWrite(state, command.path, command.content);
    }

    if (command.name === ".") {
      return stay('Did you mean "cd ."?');
    }

    if (command.name === "..") {
      return stay('Did you mean "cd .."?');
    }

    const handler = commandHandlers[command.name];
    if (!handler) {
      return stay(`Unknown command: ${command.name}\nType "help" to see available commands.`);
    }

    return handler.execute(state, command.args);
  } catch (error) {
    return stay(formatError(error));
  }
}

const commandHandlers: Record<string, CliCommandHandler> = {
  help: {
    usage: "Usage: help",
    execute: (_state, args) => withNoArgs(args, "Usage: help", () => stay(HELP_TEXT)),
  },
  pwd: {
    usage: "Usage: pwd",
    execute: (state, args) => withNoArgs(args, "Usage: pwd", () => stay(state.fs.pwd())),
  },
  ls: {
    usage: "Usage: ls [path]",
    execute: (state, args) =>
      withOptionalArg(args, "Usage: ls [path]", (path) => stay(formatEntries(state.fs.ls(path)))),
  },
  cd: {
    usage: "Usage: cd <path>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: cd <path>", 1, ([path]) => {
        state.fs.cd(path);
        return stay("");
      }),
  },
  mkdir: {
    usage: "Usage: mkdir <path> [--recursive]",
    execute: handleMkdir,
  },
  rmdir: {
    usage: "Usage: rmdir <path>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: rmdir <path>", 1, ([path]) => {
        state.fs.rmdir(path);
        return stay("");
      }),
  },
  touch: {
    usage: "Usage: touch <path>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: touch <path>", 1, ([path]) => {
        state.fs.touch(path);
        return stay("");
      }),
  },
  read: {
    usage: "Usage: read <path>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: read <path>", 1, ([path]) => stay(state.fs.readFile(path))),
  },
  mv: {
    usage: "Usage: mv <source> <target>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: mv <source> <target>", 2, ([source, target]) => {
        state.fs.move(source, target);
        return stay("");
      }),
  },
  cp: {
    usage: "Usage: cp <source> <target>",
    execute: (state, args) =>
      withExactArgs(args, "Usage: cp <source> <target>", 2, ([source, target]) => {
        state.fs.copy(source, target);
        return stay("");
      }),
  },
  find: {
    usage: "Usage: find <name> [startPath]",
    execute: (state, args) =>
      withArgRange(args, "Usage: find <name> [startPath]", 1, 2, ([name, startPath]) =>
        stay(formatSearchResults(state.fs.find(name, startPath))),
      ),
  },
  tree: {
    usage: "Usage: tree [path]",
    execute: (state, args) =>
      withOptionalArg(args, "Usage: tree [path]", (path) => stay(formatTree(state.fs, path ?? "/"))),
  },
  clear: {
    usage: "Usage: clear",
    execute: (state, args) =>
      withNoArgs(args, "Usage: clear", () => {
        state.fs = new InMemoryFileSystem();
        return stay("Filesystem reset.");
      }),
  },
  exit: {
    usage: "Usage: exit",
    execute: (_state, args) => withNoArgs(args, "Usage: exit", () => leave("Goodbye.")),
  },
  quit: {
    usage: "Usage: quit",
    execute: (_state, args) => withNoArgs(args, "Usage: quit", () => leave("Goodbye.")),
  },
};

function handleWrite(state: CliState, path: string | undefined, content: string | undefined): CommandResult {
  if (!path || content === undefined) {
    return stay("Usage: write <path> <content...>");
  }

  state.fs.writeFile(path, content);
  return stay("");
}

function handleMkdir(state: CliState, args: string[]): CommandResult {
  const usage = commandHandlers.mkdir.usage;

  if (args.length < 1 || args.length > 2) {
    return stay(usage);
  }

  const recursiveFlags = args.filter((arg) => arg === "--recursive");
  const unknownFlags = args.filter((arg) => arg.startsWith("--") && arg !== "--recursive");
  const paths = args.filter((arg) => !arg.startsWith("--"));

  if (paths.length !== 1 || recursiveFlags.length > 1 || unknownFlags.length > 0) {
    return stay(usage);
  }

  state.fs.mkdir(paths[0], { recursive: recursiveFlags.length === 1 });
  return stay("");
}

function withNoArgs(args: string[], usage: string, run: () => CommandResult): CommandResult {
  if (args.length !== 0) {
    return stay(usage);
  }

  return run();
}

function withExactArgs(
  args: string[],
  usage: string,
  expectedCount: number,
  run: (args: string[]) => CommandResult,
): CommandResult {
  if (args.length !== expectedCount) {
    return stay(usage);
  }

  return run(args);
}

function withOptionalArg(
  args: string[],
  usage: string,
  run: (arg: string | undefined) => CommandResult,
): CommandResult {
  if (args.length > 1) {
    return stay(usage);
  }

  return run(args[0]);
}

function withArgRange(
  args: string[],
  usage: string,
  minCount: number,
  maxCount: number,
  run: (args: string[]) => CommandResult,
): CommandResult {
  if (args.length < minCount || args.length > maxCount) {
    return stay(usage);
  }

  return run(args);
}

function stay(output: string): CommandResult {
  return {
    output,
    shouldExit: false,
  };
}

function leave(output: string): CommandResult {
  return {
    output,
    shouldExit: true,
  };
}

function formatError(error: unknown): string {
  if (error instanceof FileSystemError || error instanceof Error) {
    return `Error: ${error.message}`;
  }

  return "Error: Unknown error";
}
