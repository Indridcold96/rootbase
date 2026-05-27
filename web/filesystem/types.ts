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

export type FilesystemCommand =
  | { command: "cd"; payload: { path: string } }
  | { command: "mkdir"; payload: { path: string; recursive?: boolean } }
  | { command: "rmdir"; payload: { path: string } }
  | { command: "touch"; payload: { path: string } }
  | { command: "writeFile"; payload: { path: string; content: string } }
  | { command: "readFile"; payload: { path: string } }
  | { command: "move"; payload: { sourcePath: string; targetPath: string } }
  | { command: "copy"; payload: { sourcePath: string; targetPath: string } }
  | { command: "find"; payload: { name: string; startPath?: string } }
  | { command: "clear"; payload?: Record<string, never> };

export type FilesystemCommandResult =
  | { snapshot: FileSystemSnapshot; fileContent?: never; results?: never }
  | { snapshot: FileSystemSnapshot; fileContent: string; results?: never }
  | { snapshot: FileSystemSnapshot; fileContent?: never; results: SearchResult[] };
