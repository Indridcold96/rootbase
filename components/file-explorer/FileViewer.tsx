"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface FileViewerProps {
  selectedFilePath?: string;
  content: string;
  pending: boolean;
  onContentChange: (content: string) => void;
  onRead: () => void;
  onWrite: () => void;
}

export function FileViewer({
  selectedFilePath,
  content,
  pending,
  onContentChange,
  onRead,
  onWrite,
}: FileViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg bg-muted px-3 py-2 font-mono text-sm text-muted-foreground">
          {selectedFilePath ?? "No file selected"}
        </div>
        <Textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          className="min-h-36 font-mono"
          disabled={!selectedFilePath || pending}
        />
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onRead} disabled={!selectedFilePath || pending}>
            Read
          </Button>
          <Button type="button" onClick={onWrite} disabled={!selectedFilePath || pending}>
            Write
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
