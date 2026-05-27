import { describe, expect, it } from "vitest";
import { parseCommand } from "../../cli/commandParser";

describe("parseCommand", () => {
  it("parses simple commands", () => {
    expect(parseCommand("pwd")).toEqual({ kind: "command", name: "pwd", args: [] });
    expect(parseCommand("cd /school/homework")).toEqual({
      kind: "command",
      name: "cd",
      args: ["/school/homework"],
    });
    expect(parseCommand("mkdir /school/homework --recursive")).toEqual({
      kind: "command",
      name: "mkdir",
      args: ["/school/homework", "--recursive"],
    });
  });

  it("parses empty input", () => {
    expect(parseCommand("   ")).toEqual({ kind: "empty" });
  });

  it("parses write commands with multi-word content", () => {
    expect(parseCommand("write notes.txt hello from rootbase")).toEqual({
      kind: "write",
      path: "notes.txt",
      content: "hello from rootbase",
    });
  });

  it("keeps write usage state explicit when arguments are missing", () => {
    expect(parseCommand("write")).toEqual({ kind: "write" });
    expect(parseCommand("write notes.txt")).toEqual({ kind: "write", path: "notes.txt" });
  });
});
