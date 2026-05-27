import { describe, expect, it } from "vitest";
import {
  CannotRemoveRootError,
  DirectoryNotEmptyError,
  InMemoryFileSystem,
  InvalidMoveOperationError,
  NodeAlreadyExistsError,
  NodeNotFoundError,
  NotADirectoryError,
  NotAFileError,
} from "../../core/filesystem";

describe("InMemoryFileSystem", () => {
  describe("basic directory operations", () => {
    it("starts at root", () => {
      const fs = new InMemoryFileSystem();

      expect(fs.pwd()).toBe("/");
    });

    it("creates, changes into, lists, and removes child directories", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("school");
      expect(fs.ls()).toEqual([{ name: "school", type: "directory", path: "/school" }]);

      fs.cd("school");
      expect(fs.pwd()).toBe("/school");

      fs.cd(".");
      expect(fs.pwd()).toBe("/school");

      fs.cd("..");
      fs.rmdir("school");
      expect(fs.ls()).toEqual([]);
    });

    it("sorts directory listings alphabetically", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("zeta");
      fs.mkdir("alpha");
      fs.touch("middle.txt");

      expect(fs.ls().map((entry) => entry.name)).toEqual(["alpha", "middle.txt", "zeta"]);
    });

    it("rejects removing non-empty directories and root", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("school");
      fs.touch("school/notes.txt");

      expect(() => fs.rmdir("school")).toThrow(DirectoryNotEmptyError);
      expect(() => fs.rmdir("/")).toThrow(CannotRemoveRootError);
    });
  });

  describe("file operations", () => {
    it("creates empty files, writes content, and reads content", () => {
      const fs = new InMemoryFileSystem();

      fs.touch("notes.txt");
      expect(fs.readFile("notes.txt")).toBe("");

      fs.writeFile("notes.txt", "Bring a calculator.");
      expect(fs.readFile("notes.txt")).toBe("Bring a calculator.");
    });

    it("throws specific errors for invalid file operations", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("school");

      expect(() => fs.readFile("school")).toThrow(NotAFileError);
      expect(() => fs.writeFile("school", "content")).toThrow(NotAFileError);
      expect(() => fs.touch("school")).toThrow(NodeAlreadyExistsError);
      expect(() => fs.writeFile("missing.txt", "content")).toThrow(NodeNotFoundError);
    });
  });

  describe("path behavior", () => {
    it("supports nested absolute, relative, dot, parent, and repeated-slash paths", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school//homework", { recursive: true });
      fs.touch("/school/homework/math.txt");
      fs.cd("/school/homework");

      expect(fs.readFile("./math.txt")).toBe("");

      fs.mkdir("../archive");
      fs.cd("../archive");
      expect(fs.pwd()).toBe("/school/archive");
    });

    it("creates intermediate directories recursively", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school/homework/math", { recursive: true });

      expect(fs.ls("/school/homework")).toEqual([
        { name: "math", type: "directory", path: "/school/homework/math" },
      ]);
    });

    it("requires existing parents when recursive is omitted", () => {
      const fs = new InMemoryFileSystem();

      expect(() => fs.mkdir("/school/homework")).toThrow(NodeNotFoundError);
    });

    it("throws when recursively creating a directory that already exists", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school", { recursive: true });

      expect(() => fs.mkdir("/school", { recursive: true })).toThrow(NodeAlreadyExistsError);
    });
  });

  describe("move and copy", () => {
    it("renames files in the same directory", () => {
      const fs = new InMemoryFileSystem();

      fs.touch("notes.txt");
      fs.writeFile("notes.txt", "hello");
      fs.move("notes.txt", "renamed.txt");

      expect(fs.readFile("renamed.txt")).toBe("hello");
      expect(() => fs.readFile("notes.txt")).toThrow(NodeNotFoundError);
    });

    it("moves files to another directory", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("archive");
      fs.touch("notes.txt");
      fs.move("notes.txt", "archive/notes.txt");

      expect(fs.ls("archive")).toEqual([{ name: "notes.txt", type: "file", path: "/archive/notes.txt" }]);
    });

    it("moves directories while preserving children and parent references", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school/homework", { recursive: true });
      fs.touch("/school/homework/math.txt");
      fs.mkdir("/archive");
      fs.move("/school/homework", "/archive/homework");

      expect(fs.readFile("/archive/homework/math.txt")).toBe("");
      expect(fs.ls("/archive")).toEqual([{ name: "homework", type: "directory", path: "/archive/homework" }]);
    });

    it("copies files and deep-copies directories", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school/homework", { recursive: true });
      fs.touch("/school/homework/math.txt");
      fs.writeFile("/school/homework/math.txt", "2 + 2 = 4");
      fs.copy("/school/homework", "/school/homework-copy");
      fs.writeFile("/school/homework-copy/math.txt", "changed");

      expect(fs.readFile("/school/homework/math.txt")).toBe("2 + 2 = 4");
      expect(fs.readFile("/school/homework-copy/math.txt")).toBe("changed");
    });

    it("rejects overwrites, moving root, and moving directories into themselves or descendants", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/school/homework", { recursive: true });
      fs.touch("/school/notes.txt");
      fs.touch("/school/existing.txt");

      expect(() => fs.move("/school/notes.txt", "/school/existing.txt")).toThrow(NodeAlreadyExistsError);
      expect(() => fs.copy("/school/notes.txt", "/school/existing.txt")).toThrow(NodeAlreadyExistsError);
      expect(() => fs.move("/", "/root-copy")).toThrow(InvalidMoveOperationError);
      expect(() => fs.move("/school", "/school")).toThrow(NodeAlreadyExistsError);
      expect(() => fs.move("/school", "/school/homework/school")).toThrow(InvalidMoveOperationError);
    });
  });

  describe("find and walk", () => {
    it("finds exact matching files and directories recursively with deterministic paths", () => {
      const fs = new InMemoryFileSystem();

      fs.mkdir("/b/target", { recursive: true });
      fs.mkdir("/a/target", { recursive: true });
      fs.touch("/a/target.txt");
      fs.touch("/b/target/file.txt");

      expect(fs.find("target")).toEqual([
        { name: "target", type: "directory", path: "/a/target" },
        { name: "target", type: "directory", path: "/b/target" },
      ]);
      expect(fs.find("target.txt")).toEqual([{ name: "target.txt", type: "file", path: "/a/target.txt" }]);
    });

    it("walks nodes depth-first", () => {
      const fs = new InMemoryFileSystem();
      const visited: string[] = [];

      fs.mkdir("/school/homework", { recursive: true });
      fs.touch("/school/homework/math.txt");
      fs.touch("/school/notes.txt");
      fs.walk("/school", (entry) => {
        visited.push(entry.path);
      });

      expect(visited).toEqual(["/school", "/school/homework", "/school/homework/math.txt", "/school/notes.txt"]);
    });

    it("lets visitors skip recursion into a directory", () => {
      const fs = new InMemoryFileSystem();
      const visited: string[] = [];

      fs.mkdir("/school/homework", { recursive: true });
      fs.touch("/school/homework/math.txt");
      fs.touch("/school/notes.txt");
      fs.walk("/school", (entry) => {
        visited.push(entry.path);
        if (entry.path === "/school/homework") {
          return false;
        }
      });

      expect(visited).toEqual(["/school", "/school/homework", "/school/notes.txt"]);
    });

    it("requires walking a real path", () => {
      const fs = new InMemoryFileSystem();

      expect(() => fs.walk("/missing", () => undefined)).toThrow(NodeNotFoundError);
      expect(() => fs.ls("/missing")).toThrow(NodeNotFoundError);
      fs.touch("notes.txt");
      expect(() => fs.ls("notes.txt")).toThrow(NotADirectoryError);
    });
  });
});
