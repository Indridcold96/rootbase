"use client";

import { File, Folder, MoveUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DirectoryEntry } from "@/web/filesystem/types";

interface DirectoryEntriesProps {
  cwd: string;
  entries: DirectoryEntry[];
  selectedFilePath?: string;
  onParent: () => void;
  onDirectorySelect: (path: string) => void;
  onFileSelect: (path: string) => void;
}

export function DirectoryEntries({
  cwd,
  entries,
  selectedFilePath,
  onParent,
  onDirectorySelect,
  onFileSelect,
}: DirectoryEntriesProps) {
  return (
    <Card className="min-h-[420px]">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Directory</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={onParent} disabled={cwd === "/"}>
            <MoveUp className="size-4" />
            Parent
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 rounded-lg bg-muted px-3 py-2 font-mono text-sm">{cwd}</div>
        <ScrollArea className="h-[470px] pr-3">
          {entries.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/40 p-4">
              <p className="text-sm font-medium">This directory is empty.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a file or directory from the actions panel.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {entries.map((entry) => {
                const Icon = entry.type === "directory" ? Folder : File;
                const isActive = entry.path === selectedFilePath;

                return (
                  <button
                    key={entry.path}
                    type="button"
                    data-testid={`directory-entry-${entry.path}`}
                    className={[
                      "flex w-full items-center gap-3 px-2 py-3 text-left text-sm hover:bg-muted",
                      isActive ? "bg-muted" : "",
                    ].join(" ")}
                    onClick={() =>
                      entry.type === "directory" ? onDirectorySelect(entry.path) : onFileSelect(entry.path)
                    }
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{entry.name}</span>
                      <span className="block truncate font-mono text-xs text-muted-foreground">{entry.path}</span>
                    </span>
                    <span className="text-xs text-muted-foreground">{entry.type}</span>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
