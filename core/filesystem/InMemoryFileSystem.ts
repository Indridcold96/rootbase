import {
  CannotRemoveRootError,
  DirectoryNotEmptyError,
  InvalidMoveOperationError,
  NodeAlreadyExistsError,
  NodeNotFoundError,
  NotADirectoryError,
  NotAFileError,
} from "./errors";
import {
  createDirectoryNode,
  createFileNode,
  type DirectoryNode,
  type FileSystemNode,
} from "./nodes";
import { PathResolver } from "./PathResolver";
import type { DirectoryEntry, MkdirOptions, SearchResult, WalkVisitor } from "./types";

export class InMemoryFileSystem {
  private readonly root: DirectoryNode;
  private currentDirectory: DirectoryNode;
  private readonly paths: PathResolver;

  constructor() {
    this.root = createDirectoryNode("", null);
    this.currentDirectory = this.root;
    this.paths = new PathResolver(this.root, () => this.currentDirectory);
  }

  pwd(): string {
    return this.paths.getPath(this.currentDirectory);
  }

  cd(path: string): void {
    this.currentDirectory = this.paths.resolveDirectory(path);
  }

  mkdir(path: string, options: MkdirOptions = {}): void {
    if (!options.recursive) {
      const { parent, name } = this.paths.resolveParent(path);
      this.ensureMissing(parent, name, path);
      this.addChild(parent, createDirectoryNode(name, parent));
      return;
    }

    const segments = this.paths.normalize(path);
    if (segments.length === 0) {
      throw new NodeAlreadyExistsError(`Directory already exists: ${path}`);
    }

    let parent = path.startsWith("/") ? this.root : this.currentDirectory;

    for (const [index, segment] of segments.entries()) {
      const existing = parent.children.get(segment);
      const isLast = index === segments.length - 1;

      if (existing) {
        if (isLast) {
          throw new NodeAlreadyExistsError(`Directory already exists: ${path}`);
        }
        if (existing.type !== "directory") {
          throw new NotADirectoryError(`Path segment is not a directory: ${segment}`);
        }
        parent = existing;
        continue;
      }

      const next = createDirectoryNode(segment, parent);
      this.addChild(parent, next);
      parent = next;
    }
  }

  ls(path = "."): DirectoryEntry[] {
    const directory = this.paths.resolveDirectory(path);

    return [...directory.children.values()]
      .map((node) => this.toEntry(node))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  rmdir(path: string): void {
    const node = this.paths.resolve(path);

    if (node === this.root) {
      throw new CannotRemoveRootError("Cannot remove root directory");
    }
    if (node.type !== "directory") {
      throw new NotADirectoryError(`Path is not a directory: ${path}`);
    }
    if (node.children.size > 0) {
      throw new DirectoryNotEmptyError(`Directory is not empty: ${path}`);
    }

    this.removeFromParent(node);
  }

  touch(path: string): void {
    const { parent, name } = this.paths.resolveParent(path);
    this.ensureMissing(parent, name, path);
    this.addChild(parent, createFileNode(name, parent));
  }

  writeFile(path: string, content: string): void {
    const node = this.paths.resolve(path);

    if (node.type !== "file") {
      throw new NotAFileError(`Path is not a file: ${path}`);
    }

    node.content = content;
    node.updatedAt = new Date();
  }

  readFile(path: string): string {
    const node = this.paths.resolve(path);

    if (node.type !== "file") {
      throw new NotAFileError(`Path is not a file: ${path}`);
    }

    return node.content;
  }

  deleteFile(path: string): void {
    const node = this.paths.resolve(path);

    if (node.type !== "file") {
      throw new NotAFileError(`Path is not a file: ${path}`);
    }

    this.removeFromParent(node);
  }

  move(sourcePath: string, targetPath: string): void {
    const source = this.paths.resolve(sourcePath);
    if (source === this.root) {
      throw new InvalidMoveOperationError("Cannot move root directory");
    }

    const { parent: targetParent, name: targetName } = this.paths.resolveParent(targetPath);
    this.ensureMissing(targetParent, targetName, targetPath);

    if (source.type === "directory") {
      if (source === targetParent || this.isDescendant(targetParent, source)) {
        throw new InvalidMoveOperationError("Cannot move a directory into itself or a descendant");
      }
    }

    this.removeFromParent(source);
    source.name = targetName;
    source.parent = targetParent;
    source.updatedAt = new Date();
    this.addChild(targetParent, source);
  }

  copy(sourcePath: string, targetPath: string): void {
    const source = this.paths.resolve(sourcePath);
    const { parent, name } = this.paths.resolveParent(targetPath);
    this.ensureMissing(parent, name, targetPath);

    const copy = this.cloneNode(source, name, parent);
    this.addChild(parent, copy);
  }

  find(name: string, startPath = "."): SearchResult[] {
    this.paths.validateName(name);

    const results: SearchResult[] = [];
    this.walk(startPath, (entry) => {
      if (entry.name === name) {
        results.push(entry);
      }
    });

    return results.sort((a, b) => a.path.localeCompare(b.path));
  }

  walk(path: string, visitor: WalkVisitor): void {
    const start = this.paths.resolve(path);
    this.walkNode(start, visitor);
  }

  private walkNode(node: FileSystemNode, visitor: WalkVisitor): void {
    const shouldDescend = visitor(this.toEntry(node));

    if (node.type !== "directory" || shouldDescend === false) {
      return;
    }

    const children = [...node.children.values()].sort((a, b) => a.name.localeCompare(b.name));
    for (const child of children) {
      this.walkNode(child, visitor);
    }
  }

  private cloneNode(node: FileSystemNode, name: string, parent: DirectoryNode): FileSystemNode {
    if (node.type === "file") {
      const copy = createFileNode(name, parent);
      copy.content = node.content;
      return copy;
    }

    const copy = createDirectoryNode(name, parent);
    for (const child of node.children.values()) {
      copy.children.set(child.name, this.cloneNode(child, child.name, copy));
    }
    return copy;
  }

  private isDescendant(candidate: DirectoryNode, ancestor: DirectoryNode): boolean {
    let current: DirectoryNode | null = candidate;

    while (current) {
      if (current === ancestor) {
        return true;
      }
      current = current.parent;
    }

    return false;
  }

  private addChild(parent: DirectoryNode, child: FileSystemNode): void {
    parent.children.set(child.name, child);
    parent.updatedAt = new Date();
  }

  private removeFromParent(node: FileSystemNode): void {
    if (!node.parent) {
      throw new NodeNotFoundError(`Node has no parent: ${node.name}`);
    }

    node.parent.children.delete(node.name);
    node.parent.updatedAt = new Date();
  }

  private ensureMissing(parent: DirectoryNode, name: string, path: string): void {
    if (parent.children.has(name)) {
      throw new NodeAlreadyExistsError(`Node already exists: ${path}`);
    }
  }

  private toEntry(node: FileSystemNode): DirectoryEntry {
    return {
      name: node.name,
      type: node.type,
      path: this.paths.getPath(node),
    };
  }
}
