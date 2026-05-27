import { InvalidPathError, NodeNotFoundError, NotADirectoryError } from "./errors";
import type { DirectoryNode, FileSystemNode } from "./nodes";

export interface ParentResolution {
  parent: DirectoryNode;
  name: string;
}

export class PathResolver {
  constructor(
    private readonly root: DirectoryNode,
    private readonly getCurrentDirectory: () => DirectoryNode,
  ) {}

  resolve(path: string): FileSystemNode {
    const segments = this.parse(path);
    let current: FileSystemNode = path.startsWith("/") ? this.root : this.getCurrentDirectory();

    for (const segment of segments) {
      if (segment === "..") {
        current = current.parent ?? this.root;
        continue;
      }

      if (current.type !== "directory") {
        throw new NotADirectoryError(`Path segment "${current.name}" is not a directory`);
      }

      const next = current.children.get(segment);
      if (!next) {
        throw new NodeNotFoundError(`Path not found: ${path}`);
      }

      current = next;
    }

    return current;
  }

  resolveDirectory(path: string): DirectoryNode {
    const node = this.resolve(path);

    if (node.type !== "directory") {
      throw new NotADirectoryError(`Path is not a directory: ${path}`);
    }

    return node;
  }

  resolveParent(path: string): ParentResolution {
    const segments = this.parse(path);

    if (segments.length === 0) {
      throw new InvalidPathError(`Path must include a name: ${path}`);
    }

    const name = segments[segments.length - 1];
    this.validateName(name);

    const parentSegments = segments.slice(0, -1);
    let parent: DirectoryNode = path.startsWith("/") ? this.root : this.getCurrentDirectory();

    for (const segment of parentSegments) {
      if (segment === "..") {
        parent = parent.parent ?? this.root;
        continue;
      }

      const next = parent.children.get(segment);
      if (!next) {
        throw new NodeNotFoundError(`Parent path not found: ${path}`);
      }
      if (next.type !== "directory") {
        throw new NotADirectoryError(`Parent path contains a file: ${segment}`);
      }
      parent = next;
    }

    return { parent, name };
  }

  normalize(path: string): string[] {
    const segments = this.parse(path);
    const normalized = path.startsWith("/") ? [] : this.getPath(this.getCurrentDirectory()).split("/").filter(Boolean);

    for (const segment of segments) {
      if (segment === "..") {
        normalized.pop();
        continue;
      }

      normalized.push(segment);
    }

    return normalized;
  }

  private parse(path: string): string[] {
    if (typeof path !== "string") {
      throw new InvalidPathError("Path must be a string");
    }

    if (path.length === 0 || path.trim() !== path) {
      throw new InvalidPathError(`Invalid path: "${path}"`);
    }

    if (path.includes("\\")) {
      throw new InvalidPathError(`Windows-style paths are not supported: ${path}`);
    }

    const segments: string[] = [];

    for (const rawSegment of path.split("/")) {
      if (rawSegment === "" || rawSegment === ".") {
        continue;
      }

      if (rawSegment === "..") {
        segments.push(rawSegment);
        continue;
      }

      this.validateName(rawSegment);
      segments.push(rawSegment);
    }

    return segments;
  }

  validateName(name: string): void {
    if (name.length === 0 || name === "." || name === ".." || name.includes("/") || name.includes("\\")) {
      throw new InvalidPathError(`Invalid path name: "${name}"`);
    }
  }

  getPath(node: FileSystemNode): string {
    const names: string[] = [];
    let current: FileSystemNode | null = node;

    while (current.parent) {
      names.unshift(current.name);
      current = current.parent;
    }

    return names.length === 0 ? "/" : `/${names.join("/")}`;
  }
}
