"use client";

import { useCallback, useEffect, useState } from "react";
import { DirectoryEntries } from "@/components/file-explorer/DirectoryEntries";
import { FileActionsPanel } from "@/components/file-explorer/FileActionsPanel";
import { FileExplorerShell } from "@/components/file-explorer/FileExplorerShell";
import { FileTree } from "@/components/file-explorer/FileTree";
import { FileViewer } from "@/components/file-explorer/FileViewer";
import { FindResults } from "@/components/file-explorer/FindResults";
import { executeFilesystemCommand, getFilesystemSnapshot } from "@/web/filesystem/api";
import type { FileSystemSnapshot, FilesystemCommand, SearchResult } from "@/web/filesystem/types";

export function RootbaseExplorerScreen() {
  const [snapshot, setSnapshot] = useState<FileSystemSnapshot | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>();
  const [fileContent, setFileContent] = useState("");
  const [findResults, setFindResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  const loadSnapshot = useCallback(async () => {
    setLoading(true);
    setError(undefined);

    try {
      setSnapshot(await getFilesystemSnapshot());
    } catch (caught) {
      setError(readError(caught));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadInitialSnapshot(): Promise<void> {
      try {
        const nextSnapshot = await getFilesystemSnapshot();
        if (isActive) {
          setSnapshot(nextSnapshot);
        }
      } catch (caught) {
        if (isActive) {
          setError(readError(caught));
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadInitialSnapshot();

    return () => {
      isActive = false;
    };
  }, []);

  const runCommand = useCallback(async (command: FilesystemCommand) => {
    setPending(true);
    setError(undefined);

    try {
      const result = await executeFilesystemCommand(command);
      setSnapshot(result.snapshot);
      return result;
    } catch (caught) {
      setError(readError(caught));
      return undefined;
    } finally {
      setPending(false);
    }
  }, []);

  const selectDirectory = useCallback(
    async (path: string) => {
      const result = await runCommand({ command: "cd", payload: { path } });
      if (result) {
        setSelectedFilePath(undefined);
        setFileContent("");
      }
    },
    [runCommand],
  );

  const selectFile = useCallback(
    async (path: string) => {
      const result = await runCommand({ command: "readFile", payload: { path } });
      if (result?.fileContent !== undefined) {
        setSelectedFilePath(path);
        setFileContent(result.fileContent);
      }
    },
    [runCommand],
  );

  const mutate = useCallback(
    async (command: FilesystemCommand) => {
      const result = await runCommand(command);
      if (result) {
        setFindResults([]);
      }
    },
    [runCommand],
  );

  const reset = useCallback(async () => {
    const result = await runCommand({ command: "clear" });
    if (result) {
      setSelectedFilePath(undefined);
      setFileContent("");
      setFindResults([]);
    }
  }, [runCommand]);

  if (!snapshot) {
    return (
      <FileExplorerShell
        cwd="/"
        loading={loading}
        error={error}
        onRefresh={loadSnapshot}
        onReset={reset}
        tree={<PanelLoading label="Filesystem" />}
        entries={<PanelLoading label="Directory" />}
        actions={<PanelLoading label="Actions" />}
        viewer={<PanelLoading label="File" />}
        results={<PanelLoading label="Find results" />}
      />
    );
  }

  return (
    <FileExplorerShell
      cwd={snapshot.cwd}
      loading={loading || pending}
      error={error}
      onRefresh={loadSnapshot}
      onReset={reset}
      tree={
        <FileTree
          tree={snapshot.tree}
          cwd={snapshot.cwd}
          selectedFilePath={selectedFilePath}
          onDirectorySelect={selectDirectory}
          onFileSelect={selectFile}
        />
      }
      entries={
        <DirectoryEntries
          cwd={snapshot.cwd}
          entries={snapshot.entries}
          selectedFilePath={selectedFilePath}
          onParent={() => void selectDirectory("..")}
          onDirectorySelect={selectDirectory}
          onFileSelect={selectFile}
        />
      }
      actions={
        <FileActionsPanel
          pending={pending}
          onMkdir={(path, recursive) => void mutate({ command: "mkdir", payload: { path, recursive } })}
          onTouch={(path) => void mutate({ command: "touch", payload: { path } })}
          onRmdir={(path) => void mutate({ command: "rmdir", payload: { path } })}
          onMove={(sourcePath, targetPath) => void mutate({ command: "move", payload: { sourcePath, targetPath } })}
          onCopy={(sourcePath, targetPath) => void mutate({ command: "copy", payload: { sourcePath, targetPath } })}
          onFind={(name, startPath) => {
            void runCommand({ command: "find", payload: { name, startPath } }).then((result) => {
              if (result?.results) {
                setFindResults(result.results);
              }
            });
          }}
        />
      }
      viewer={
        <FileViewer
          selectedFilePath={selectedFilePath}
          content={fileContent}
          pending={pending}
          onContentChange={setFileContent}
          onRead={() => {
            if (selectedFilePath) {
              void selectFile(selectedFilePath);
            }
          }}
          onWrite={() => {
            if (selectedFilePath) {
              void mutate({ command: "writeFile", payload: { path: selectedFilePath, content: fileContent } });
            }
          }}
        />
      }
      results={
        <FindResults results={findResults} onDirectorySelect={selectDirectory} onFileSelect={selectFile} />
      }
    />
  );
}

function PanelLoading({ label }: { label: string }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function readError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}
