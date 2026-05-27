"use client";

import { File, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { TreeNode } from "@/web/filesystem/types";

interface FileTreeProps {
  tree: TreeNode;
  cwd: string;
  selectedFilePath?: string;
  onDirectorySelect: (path: string) => void;
  onFileSelect: (path: string) => void;
}

export function FileTree({ tree, cwd, selectedFilePath, onDirectorySelect, onFileSelect }: FileTreeProps) {
  return (
    <Card className="min-h-[420px]">
      <CardHeader>
        <CardTitle>Filesystem</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[520px] pr-3">
          <TreeItem
            node={tree}
            depth={0}
            cwd={cwd}
            selectedFilePath={selectedFilePath}
            onDirectorySelect={onDirectorySelect}
            onFileSelect={onFileSelect}
          />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface TreeItemProps {
  node: TreeNode;
  depth: number;
  cwd: string;
  selectedFilePath?: string;
  onDirectorySelect: (path: string) => void;
  onFileSelect: (path: string) => void;
}

function TreeItem({
  node,
  depth,
  cwd,
  selectedFilePath,
  onDirectorySelect,
  onFileSelect,
}: TreeItemProps) {
  const isDirectory = node.type === "directory";
  const isActive = isDirectory ? node.path === cwd : node.path === selectedFilePath;
  const Icon = isDirectory ? (isActive ? FolderOpen : Folder) : File;

  return (
    <div>
      <Button
        type="button"
        variant={isActive ? "secondary" : "ghost"}
        className="h-7 w-full justify-start gap-2 px-2 font-normal"
        style={{ paddingLeft: `${depth * 14 + 8}px` }}
        onClick={() => (isDirectory ? onDirectorySelect(node.path) : onFileSelect(node.path))}
      >
        <Icon className="size-4" />
        <span className="truncate">{node.path === "/" ? "/" : node.name}</span>
      </Button>

      {isDirectory && node.children?.map((child) => (
        <TreeItem
          key={child.path}
          node={child}
          depth={depth + 1}
          cwd={cwd}
          selectedFilePath={selectedFilePath}
          onDirectorySelect={onDirectorySelect}
          onFileSelect={onFileSelect}
        />
      ))}
    </div>
  );
}
