"use client";

import { File, Folder } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SearchResult } from "@/web/filesystem/types";

interface FindResultsProps {
  results: SearchResult[];
  onDirectorySelect: (path: string) => void;
  onFileSelect: (path: string) => void;
}

export function FindResults({ results, onDirectorySelect, onFileSelect }: FindResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Find results</CardTitle>
      </CardHeader>
      <CardContent>
        {results.length === 0 ? (
          <p className="text-sm text-muted-foreground">(empty)</p>
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
