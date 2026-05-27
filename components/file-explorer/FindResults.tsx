"use client";

import { File, Folder } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchResult } from "@/web/filesystem/types";

interface FindResultsProps {
  results: SearchResult[];
  hasSearched: boolean;
  onDirectorySelect: (path: string) => void;
  onFileSelect: (path: string) => void;
}

export function FindResults({ results, hasSearched, onDirectorySelect, onFileSelect }: FindResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Find results</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasSearched ? (
          <p className="text-sm text-muted-foreground">Search by exact name to show matches here.</p>
        ) : results.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm text-muted-foreground">
            No matching files or directories found.
          </div>
        ) : (
          <div className="divide-y">
            {results.map((result) => {
              const Icon = result.type === "directory" ? Folder : File;

              return (
                <button
                  key={result.path}
                  type="button"
                  className="flex w-full items-center gap-3 px-2 py-2 text-left text-sm hover:bg-muted"
                  onClick={() =>
                    result.type === "directory" ? onDirectorySelect(result.path) : onFileSelect(result.path)
                  }
                >
                  <Icon className="size-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-mono text-xs">{result.path}</span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
