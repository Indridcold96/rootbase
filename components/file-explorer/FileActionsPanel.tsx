"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileActionsPanelProps {
  pending: boolean;
  onMkdir: (path: string, recursive: boolean) => void;
  onTouch: (path: string) => void;
  onRmdir: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRename: (sourcePath: string, newName: string) => void;
  onMoveToDirectory: (sourcePath: string, destinationDirectory: string) => void;
  onCopyToDirectory: (sourcePath: string, destinationDirectory: string) => void;
  onFind: (name: string, startPath?: string) => void;
}

export function FileActionsPanel({
  pending,
  onMkdir,
  onTouch,
  onRmdir,
  onDeleteFile,
  onRename,
  onMoveToDirectory,
  onCopyToDirectory,
  onFind,
}: FileActionsPanelProps) {
  const [mkdirPath, setMkdirPath] = useState("");
  const [recursive, setRecursive] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [removePath, setRemovePath] = useState("");
  const [removeFilePath, setRemoveFilePath] = useState("");
  const [renameSource, setRenameSource] = useState("");
  const [renameName, setRenameName] = useState("");
  const [moveSource, setMoveSource] = useState("");
  const [moveDestination, setMoveDestination] = useState("");
  const [copySource, setCopySource] = useState("");
  const [copyDestination, setCopyDestination] = useState("");
  const [findName, setFindName] = useState("");
  const [findStart, setFindStart] = useState("");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onMkdir(mkdirPath, recursive);
          }}
        >
          <Label htmlFor="mkdir-path">Create directory</Label>
          <div className="flex gap-2">
            <Input id="mkdir-path" value={mkdirPath} onChange={(event) => setMkdirPath(event.target.value)} />
            <Button type="submit" disabled={pending || mkdirPath.length === 0}>
              mkdir
            </Button>
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={recursive} onChange={(event) => setRecursive(event.target.checked)} />
            recursive
          </label>
        </form>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onTouch(filePath);
          }}
        >
          <Label htmlFor="touch-path">Create file</Label>
          <div className="flex gap-2">
            <Input id="touch-path" value={filePath} onChange={(event) => setFilePath(event.target.value)} />
            <Button type="submit" disabled={pending || filePath.length === 0}>
              touch
            </Button>
          </div>
        </form>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onRmdir(removePath);
          }}
        >
          <Label htmlFor="remove-path">Remove empty directory</Label>
          <div className="flex gap-2">
            <Input id="remove-path" value={removePath} onChange={(event) => setRemovePath(event.target.value)} />
            <Button type="submit" variant="destructive" disabled={pending || removePath.length === 0}>
              rmdir
            </Button>
          </div>
        </form>

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onDeleteFile(removeFilePath);
          }}
        >
          <Label htmlFor="remove-file-path">Remove file</Label>
          <div className="flex gap-2">
            <Input
              id="remove-file-path"
              value={removeFilePath}
              onChange={(event) => setRemoveFilePath(event.target.value)}
              placeholder="file path"
            />
            <Button type="submit" variant="destructive" disabled={pending || removeFilePath.length === 0}>
              rm
            </Button>
          </div>
        </form>

        <PathPairForm
          title="Rename"
          sourceLabel="Source path"
          targetLabel="New name"
          source={renameSource}
          target={renameName}
          action="rename"
          pending={pending}
          onSourceChange={setRenameSource}
          onTargetChange={setRenameName}
          onSubmit={() => onRename(renameSource, renameName)}
        />

        <PathPairForm
          title="Move to directory"
          sourceLabel="Source path"
          targetLabel="Destination directory"
          source={moveSource}
          target={moveDestination}
          action="mv"
          pending={pending}
          onSourceChange={setMoveSource}
          onTargetChange={setMoveDestination}
          onSubmit={() => onMoveToDirectory(moveSource, moveDestination)}
        />

        <PathPairForm
          title="Copy to directory"
          sourceLabel="Source path"
          targetLabel="Destination directory"
          source={copySource}
          target={copyDestination}
          action="cp"
          pending={pending}
          onSourceChange={setCopySource}
          onTargetChange={setCopyDestination}
          onSubmit={() => onCopyToDirectory(copySource, copyDestination)}
        />

        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            onFind(findName, findStart || undefined);
          }}
        >
          <Label htmlFor="find-name">Find by exact name</Label>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input id="find-name" value={findName} onChange={(event) => setFindName(event.target.value)} />
            <Input
              aria-label="Find start path"
              value={findStart}
              onChange={(event) => setFindStart(event.target.value)}
              placeholder="start path"
            />
            <Button type="submit" disabled={pending || findName.length === 0}>
              find
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface PathPairFormProps {
  title: string;
  sourceLabel: string;
  targetLabel: string;
  source: string;
  target: string;
  action: string;
  pending: boolean;
  onSourceChange: (value: string) => void;
  onTargetChange: (value: string) => void;
  onSubmit: () => void;
}

function PathPairForm({
  title,
  sourceLabel,
  targetLabel,
  source,
  target,
  action,
  pending,
  onSourceChange,
  onTargetChange,
  onSubmit,
}: PathPairFormProps) {
  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Label>{title}</Label>
      <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <Input
          aria-label={sourceLabel}
          placeholder={sourceLabel}
          value={source}
          onChange={(event) => onSourceChange(event.target.value)}
        />
        <Input
          aria-label={targetLabel}
          placeholder={targetLabel}
          value={target}
          onChange={(event) => onTargetChange(event.target.value)}
        />
        <Button type="submit" disabled={pending || source.length === 0 || target.length === 0}>
          {action}
        </Button>
      </div>
    </form>
  );
}
