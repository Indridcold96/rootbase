import { beforeEach, describe, expect, it } from "vitest";
import { executeFilesystemCommand, getSnapshot } from "../../server/filesystem/filesystemService";

describe("filesystemService", () => {
  beforeEach(() => {
    executeFilesystemCommand({ command: "clear" });
  });

  it("returns a snapshot from the singleton filesystem", () => {
    const snapshot = getSnapshot();

    expect(snapshot.cwd).toBe("/");
    expect(snapshot.entries).toEqual([]);
    expect(snapshot.tree).toEqual({
      name: "/",
      type: "directory",
      path: "/",
      children: [],
    });
  });

  it("executes mutations through the core and builds a recursive tree", () => {
    executeFilesystemCommand({ command: "mkdir", payload: { path: "/school/homework", recursive: true } });
    executeFilesystemCommand({ command: "touch", payload: { path: "/school/homework/notes.txt" } });
    executeFilesystemCommand({
      command: "writeFile",
      payload: { path: "/school/homework/notes.txt", content: "hello" },
    });

    const readResult = executeFilesystemCommand({
      command: "readFile",
      payload: { path: "/school/homework/notes.txt" },
    });

    expect("fileContent" in readResult ? readResult.fileContent : undefined).toBe("hello");
    expect(getSnapshot().tree.children).toEqual([
      {
        name: "school",
        type: "directory",
        path: "/school",
        children: [
          {
            name: "homework",
            type: "directory",
            path: "/school/homework",
            children: [{ name: "notes.txt", type: "file", path: "/school/homework/notes.txt" }],
          },
        ],
      },
    ]);
  });

  it("returns find results with the updated snapshot", () => {
    executeFilesystemCommand({ command: "mkdir", payload: { path: "/notes", recursive: true } });
    executeFilesystemCommand({ command: "touch", payload: { path: "/notes/take-home.txt" } });

    const result = executeFilesystemCommand({ command: "find", payload: { name: "take-home.txt", startPath: "/" } });

    expect("results" in result ? result.results : []).toEqual([
      { name: "take-home.txt", type: "file", path: "/notes/take-home.txt" },
    ]);
    expect(result.snapshot.cwd).toBe("/");
  });
});
