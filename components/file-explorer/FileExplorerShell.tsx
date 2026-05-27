import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface FileExplorerShellProps {
  cwd: string;
  loading: boolean;
  error?: string;
  tree: ReactNode;
  entries: ReactNode;
  actions: ReactNode;
  viewer: ReactNode;
  results: ReactNode;
  onRefresh: () => void;
  onReset: () => void;
}

export function FileExplorerShell({
  cwd,
  loading,
  error,
  tree,
  entries,
  actions,
  viewer,
  results,
  onRefresh,
  onReset,
}: FileExplorerShellProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 md:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div>
              <h1 className="text-3xl font-semibold tracking-normal">Rootbase</h1>
              <p className="mt-1 text-sm text-muted-foreground">An in-memory filesystem explorer</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">In-memory</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">No disk writes</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              State lives in server memory and resets when the process restarts.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-lg border bg-card px-3 py-2 font-mono text-sm">{cwd}</div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onRefresh} disabled={loading}>
                Refresh
              </Button>
              <Button type="button" variant="destructive" onClick={onReset} disabled={loading}>
                Reset
              </Button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)_360px]">
          {tree}
          {entries}
          <div className="flex flex-col gap-4">
            {actions}
            {viewer}
            {results}
          </div>
        </section>
      </div>
    </main>
  );
}
