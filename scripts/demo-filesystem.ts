import { InMemoryFileSystem } from "../core/filesystem";

const fs = new InMemoryFileSystem();

const section = (title: string): void => {
  console.log(title);
  console.log("-".repeat(title.length));
};

const printEntries = (label: string, path: string): void => {
  console.log(label);
  for (const entry of fs.ls(path)) {
    console.log(`- ${entry.type}: ${entry.path}`);
  }
};

const printTree = (fileSystem: InMemoryFileSystem, rootPath = "/"): string => {
  const lines: string[] = [rootPath];

  const walk = (path: string, prefix: string): void => {
    const entries = fileSystem.ls(path);

    entries.forEach((entry, index) => {
      const isLast = index === entries.length - 1;
      const connector = isLast ? "`-- " : "|-- ";
      const childPrefix = isLast ? "    " : "|   ";
      const displayName = entry.type === "directory" ? `${entry.name}/` : entry.name;

      lines.push(`${prefix}${connector}${displayName}`);

      if (entry.type === "directory") {
        walk(entry.path, `${prefix}${childPrefix}`);
      }
    });
  };

  walk(rootPath, "");

  return lines.join("\n");
};

console.log("Rootbase in-memory filesystem demo");
console.log();

section("Assignment flow");

fs.mkdir("school");
fs.cd("school");
console.log(`pwd: ${fs.pwd()}`);
console.log();

fs.mkdir("homework");
fs.cd("homework");
fs.mkdir("math");
fs.mkdir("lunch");
fs.mkdir("history");
fs.mkdir("spanish");
fs.rmdir("lunch");
printEntries("/school/homework contents:", ".");
console.log();
console.log(`pwd: ${fs.pwd()}`);
console.log();

fs.cd("..");
fs.mkdir("cheatsheet");
printEntries("/school contents:", ".");
fs.rmdir("cheatsheet");
console.log();

fs.cd("..");
console.log(`pwd: ${fs.pwd()}`);
console.log();

section("File operations");

fs.mkdir("notes");
fs.touch("notes/take-home.txt");
fs.writeFile("notes/take-home.txt", "The core runs without Next.js.");
console.log("read /notes/take-home.txt:");
console.log(fs.readFile("notes/take-home.txt"));
console.log();

section("Final virtual filesystem tree");
console.log(printTree(fs));
