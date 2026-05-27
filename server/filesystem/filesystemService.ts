import type { DirectoryEntry, FileSystemNodeType, SearchResult } from "../../core/filesystem";
import { getFilesystem, resetFilesystem } from "./filesystemStore";
import type { FilesystemCommand } from "./filesystemSchemas";

export interface TreeNode {
  name: string;
  type: FileSystemNodeType;
  path: string;
  children?: TreeNode[];
}

export interface FileSystemSnapshot {
  cwd: string;
  tree: TreeNode;
  entries: DirectoryEntry[];
}

export type FilesystemCommandResult =
  | { snapshot: FileSystemSnapshot }
  | { snapshot: FileSystemSnapshot; fileContent: string }
  | { snapshot: FileSystemSnapshot; results: SearchResult[] };

export function getSnapshot(): FileSystemSnapshot {
  const filesystem = getFilesystem();

  return {
    cwd: filesystem.pwd(),
    tree: buildTree("/"),
    entries: filesystem.ls(),
  };
}

export function executeFilesystemCommand(command: FilesystemCommand): FilesystemCommandResult {
  let filesystem = getFilesystem();

  switch (command.command) {
    case "cd":
      filesystem.cd(command.payload.path);
      return { snapshot: getSnapshot() };
    case "mkdir":
      filesystem.mkdir(command.payload.path, { recursive: command.payload.recursive });
      return { snapshot: getSnapshot() };
    case "rmdir":
      filesystem.rmdir(command.payload.path);
      return { snapshot: getSnapshot() };
    case "deleteFile":
      filesystem.deleteFile(command.payload.path);
      return { snapshot: getSnapshot() };
    case "touch":
      filesystem.touch(command.payload.path);
      return { snapshot: getSnapshot() };
    case "writeFile":
      filesystem.writeFile(command.payload.path, command.payload.content);
      return { snapshot: getSnapshot() };
    case "readFile":
      return {
        snapshot: getSnapshot(),
        fileContent: filesystem.readFile(command.payload.path),
      };
    case "move":
      filesystem.move(command.payload.sourcePath, command.payload.targetPath);
      return { snapshot: getSnapshot() };
    case "copy":
      filesystem.copy(command.payload.sourcePath, command.payload.targetPath);
      return { snapshot: getSnapshot() };
    case "find":
      return {
        snapshot: getSnapshot(),
        results: filesystem.find(command.payload.name, command.payload.startPath),
      };
    case "clear":
      filesystem = resetFilesystem();
      return {
        snapshot: {
          cwd: filesystem.pwd(),
          tree: buildTree("/"),
          entries: filesystem.ls(),
        },
      };
    case "seedExample":
      filesystem = seedExampleFilesystem();
      return {
        snapshot: {
          cwd: filesystem.pwd(),
          tree: buildTree("/"),
          entries: filesystem.ls(),
        },
      };
  }
}

export function buildTree(path = "/"): TreeNode {
  const filesystem = getFilesystem();
  const entries = filesystem.ls(path);
  const name = path === "/" ? "/" : path.split("/").filter(Boolean).at(-1) ?? path;

  return {
    name,
    type: "directory",
    path,
    children: entries.map((entry) => buildTreeFromEntry(entry)),
  };
}

function buildTreeFromEntry(entry: DirectoryEntry): TreeNode {
  if (entry.type === "file") {
    return {
      name: entry.name,
      type: entry.type,
      path: entry.path,
    };
  }

  return buildTree(entry.path);
}

function seedExampleFilesystem() {
  const filesystem = resetFilesystem();

  filesystem.mkdir("/school/homework/math", { recursive: true });
  filesystem.mkdir("/school/homework/history", { recursive: true });
  filesystem.mkdir("/school/homework/spanish", { recursive: true });
  filesystem.touch("/school/homework/notes.txt");
  filesystem.writeFile("/school/homework/notes.txt", "Homework notes stored in Rootbase.");
  filesystem.mkdir("/notes");
  filesystem.touch("/notes/take-home.txt");
  filesystem.writeFile("/notes/take-home.txt", "Rootbase stores this file in memory only.");
  filesystem.mkdir("/archive");

  return filesystem;
}
