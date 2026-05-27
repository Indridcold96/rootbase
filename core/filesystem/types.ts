export type FileSystemNodeType = "file" | "directory";

export interface DirectoryEntry {
  name: string;
  type: FileSystemNodeType;
  path: string;
}

export interface SearchResult {
  name: string;
  type: FileSystemNodeType;
  path: string;
}

export type WalkEntry = DirectoryEntry;

export type WalkVisitor = (entry: WalkEntry) => false | void;

export interface MkdirOptions {
  recursive?: boolean;
}
