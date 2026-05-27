import {
  InMemoryFileSystem,
  NotADirectoryError,
  NotAFileError,
  type DirectoryEntry,
  type SearchResult,
} from "../core/filesystem";

export const HELP_TEXT = `Available commands:
help
pwd
ls [path]
cd <path>
mkdir <path> [--recursive]
rmdir <path>
touch <path>
write <path> <content...>
read <path>
mv <source> <target>
cp <source> <target>
find <name> [startPath]
tree [path]
clear
exit | quit

Examples:
mkdir school
mkdir /school/homework --recursive

Navigation examples:
cd material-security
cd ..
cd .
cd /school/homework

File and search examples:
write notes.txt hello from rootbase
find homework /
tree`;

export function formatEntries(entries: DirectoryEntry[]): string {
  if (entries.length === 0) {
    return "(empty)";
  }

  return entries.map((entry) => `${entry.type.padEnd(9)} ${entry.path}`).join("\n");
}

export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "(no matches)";
  }

  return results.map((entry) => `${entry.type.padEnd(9)} ${entry.path}`).join("\n");
}

export function formatTree(fileSystem: InMemoryFileSystem, startPath = "/"): string {
  try {
    const entries = fileSystem.ls(startPath);
    const lines: string[] = [normalizeTreeRoot(startPath)];
    appendDirectory(fileSystem, entries, lines, "");
    return lines.join("\n");
  } catch (error) {
    if (error instanceof NotADirectoryError) {
      fileSystem.readFile(startPath);
      return getLeafName(startPath);
    }

    throw error;
  }
}

function appendDirectory(
  fileSystem: InMemoryFileSystem,
  entries: DirectoryEntry[],
  lines: string[],
  prefix: string,
): void {
  entries.forEach((entry, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? "`-- " : "|-- ";
    const childPrefix = isLast ? "    " : "|   ";
    const displayName = entry.type === "directory" ? `${entry.name}/` : entry.name;

    lines.push(`${prefix}${connector}${displayName}`);

    if (entry.type === "directory") {
      appendDirectory(fileSystem, fileSystem.ls(entry.path), lines, `${prefix}${childPrefix}`);
    }
  });
}

function normalizeTreeRoot(path: string): string {
  return path === "" ? "/" : path;
}

function getLeafName(path: string): string {
  const parts = path.split("/").filter(Boolean);

  if (parts.length === 0) {
    throw new NotAFileError("Root is not a file");
  }

  return parts[parts.length - 1];
}
