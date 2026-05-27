import { describe, expect, it } from "vitest";
import { InMemoryFileSystem, InvalidPathError, NodeNotFoundError, NotADirectoryError } from "../../core/filesystem";

describe("PathResolver behavior through the public filesystem API", () => {
  it("resolves absolute paths", () => {
    const fs = new InMemoryFileSystem();

    fs.mkdir("/school");
    fs.mkdir("/school/homework");
    fs.cd("/school/homework");

    expect(fs.pwd()).toBe("/school/homework");
  });

  it("resolves relative paths from the current directory", () => {
    const fs = new InMemoryFileSystem();

    fs.mkdir("/school/homework", { recursive: true });
    fs.mkdir("/school/cheatsheet");
    fs.cd("/school/homework");
    fs.cd("../cheatsheet");

    expect(fs.pwd()).toBe("/school/cheatsheet");
  });

  it("resolves current and parent directory segments", () => {
    const fs = new InMemoryFileSystem();

    fs.mkdir("/school/homework", { recursive: true });
    fs.cd("/school/homework/.");
    expect(fs.pwd()).toBe("/school/homework");

    fs.cd("..");
    expect(fs.pwd()).toBe("/school");

    fs.cd("../..");
    expect(fs.pwd()).toBe("/");
  });

  it("keeps parent traversal from root at root", () => {
    const fs = new InMemoryFileSystem();

    fs.cd("..");
    expect(fs.pwd()).toBe("/");

    fs.cd("/..");
    expect(fs.pwd()).toBe("/");
  });

  it("normalizes repeated slashes", () => {
    const fs = new InMemoryFileSystem();

    fs.mkdir("/school//homework", { recursive: true });
    fs.cd("/school/homework");

    expect(fs.pwd()).toBe("/school/homework");
  });

  it("rejects invalid paths", () => {
    const fs = new InMemoryFileSystem();

    expect(() => fs.mkdir("")).toThrow(InvalidPathError);
    expect(() => fs.mkdir(" school")).toThrow(InvalidPathError);
    expect(() => fs.mkdir("school\\homework")).toThrow(InvalidPathError);
  });

  it("throws clear errors for missing paths and files used as directories", () => {
    const fs = new InMemoryFileSystem();

    expect(() => fs.cd("missing")).toThrow(NodeNotFoundError);

    fs.touch("notes.txt");
    expect(() => fs.cd("notes.txt")).toThrow(NotADirectoryError);
    expect(() => fs.mkdir("notes.txt/child")).toThrow(NotADirectoryError);
  });
});
