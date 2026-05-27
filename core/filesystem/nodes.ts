import type { FileSystemNodeType } from "./types";

export interface BaseNode {
  type: FileSystemNodeType;
  name: string;
  parent: DirectoryNode | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileNode extends BaseNode {
  type: "file";
  content: string;
}

export interface DirectoryNode extends BaseNode {
  type: "directory";
  children: Map<string, FileSystemNode>;
}

export type FileSystemNode = FileNode | DirectoryNode;

export function createDirectoryNode(
  name: string,
  parent: DirectoryNode | null,
): DirectoryNode {
  const now = new Date();

  return {
    type: "directory",
    name,
    parent,
    createdAt: now,
    updatedAt: now,
    children: new Map(),
  };
}

export function createFileNode(name: string, parent: DirectoryNode): FileNode {
  const now = new Date();

  return {
    type: "file",
    name,
    parent,
    createdAt: now,
    updatedAt: now,
    content: "",
  };
}
