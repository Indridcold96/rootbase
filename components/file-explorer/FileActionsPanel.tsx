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
  onMove: (sourcePath: string, targetPath: string) => void;
  onCopy: (sourcePath: string, targetPath: string) => void;
  onFind: (name: string, startPath?: string) => void;
}

export function FileActionsPanel({
  pending,
  onMkdir,
  onTouch,
  onRmdir,
  onMove,
  onCopy,
  onFind,
}: FileActionsPanelProps) {
  const [mkdirPath, setMkdirPath] = useState("");
  const [recursive, setRecursive] = useState(false);
  const [filePath, setFilePath] = useState("");
  const [removePath, setRemovePath] = useState("");
  const [moveSource, setMoveSource] = useState("");
  const [moveTarget, setMoveTarget] = useState("");
  const [copySource, setCopySource] = useState("");
  const [copyTarget, setCopyTarget] = useState("");
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

        <PathPairForm
          title="Move or rename"
          source={moveSource}
          target={moveTarget}
          action="mv"
          pending={pending}
          onSourceChange={setMoveSource}
          onTargetChange={setMoveTarget}
          onSubmit={() => onMove(moveSource, moveTarget)}
        />

        <PathPairForm
          title="Copy"
          source={copySource}
          target={copyTarget}
          action="cp"
          pending={pending}
          onSourceChange={setCopySource}
          onTargetChange={setCopyTarget}
          onSubmit={() => onCopy(copySource, copyTarget)}
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
        <Input aria-label={`${title} source`} value={source} onChange={(event) => onSourceChange(event.target.value)} />
        <Input aria-label={`${title} target`} value={target} onChange={(event) => onTargetChange(event.target.value)} />
        <Button type="submit" disabled={pending || source.length === 0 || target.length === 0}>
          {action}
        </Button>
      </div>
    </form>
  );
}
