import { describe, expect, it } from "vitest";
import { parseCommand } from "../../cli/commandParser";
import { createCliState, executeCommand } from "../../cli/commandHandlers";

const run = (input: string, state = createCliState()): string => {
  return executeCommand(state, parseCommand(input)).output;
};

describe("executeCommand", () => {
  it("handles help through the command registry", () => {
    const output = run("help");

    expect(output).toContain("Available commands:");
    expect(output).toContain("Navigation examples:");
  });

  it("handles unknown commands without crashing", () => {
    const output = run("wat");

    expect(output).toContain("Unknown command: wat");
    expect(output).toContain("help");
  });

  it("runs mkdir, cd, and pwd through the real filesystem core", () => {
    const state = createCliState();

    expect(run("pwd", state)).toBe("/");
    expect(run("mkdir material-security", state)).toBe("");
    expect(run("cd material-security", state)).toBe("");
    expect(run("pwd", state)).toBe("/material-security");
  });

  it("rejects extra arguments instead of silently ignoring them", () => {
    const state = createCliState();

    run("mkdir material-security", state);
    run("cd material-security", state);

    expect(run("pwd x", state)).toBe("Usage: pwd");
    expect(run("cd . material-security", state)).toBe("Usage: cd <path>");
    expect(run("pwd", state)).toBe("/material-security");
    expect(run("ls a b", state)).toBe("Usage: ls [path]");
    expect(run("tree a b", state)).toBe("Usage: tree [path]");
    expect(run("find", state)).toBe("Usage: find <name> [startPath]");
    expect(run("find a b c", state)).toBe("Usage: find <name> [startPath]");
  });

  it("suggests cd for standalone dot navigation attempts", () => {
    expect(run(".")).toBe('Did you mean "cd ."?');
    expect(run("..")).toBe('Did you mean "cd .."?');
  });

  it("validates mkdir path and recursive flag strictly", () => {
    const state = createCliState();

    expect(run("mkdir a", state)).toBe("");
    expect(run("mkdir b --recursive", state)).toBe("");
    expect(run("mkdir --recursive c", state)).toBe("");
    expect(run("mkdir d e", state)).toBe("Usage: mkdir <path> [--recursive]");
    expect(run("mkdir f --banana", state)).toBe("Usage: mkdir <path> [--recursive]");
    expect(run("mkdir g --recursive --recursive", state)).toBe("Usage: mkdir <path> [--recursive]");
  });

  it("runs touch, write, and read through the real filesystem core", () => {
    const state = createCliState();

    expect(run("touch notes.txt", state)).toBe("");
    expect(run("write notes.txt hello from rootbase", state)).toBe("");

    expect(run("read notes.txt", state)).toBe("hello from rootbase");
  });

  it("prints tree output from the real filesystem state", () => {
    const state = createCliState();

    run("mkdir /school/homework --recursive", state);
    run("mkdir /school/homework/math", state);
    run("mkdir /notes", state);
    run("touch /notes/take-home.txt", state);

    expect(run("tree", state)).toBe(
      [
        "/",
        "|-- notes/",
        "|   `-- take-home.txt",
        "`-- school/",
        "    `-- homework/",
        "        `-- math/",
      ].join("\n"),
    );
  });

  it("prints command usage for missing arguments", () => {
    const state = createCliState();

    expect(run("cd", state)).toBe("Usage: cd <path>");
    expect(run("write notes.txt", state)).toBe("Usage: write <path> <content...>");
  });

  it("formats core errors without throwing", () => {
    const state = createCliState();

    expect(() => run("cd missing", state)).not.toThrow();
    expect(run("cd missing", state)).toContain("Error:");
  });

  it("resets filesystem state with clear", () => {
    const state = createCliState();

    run("mkdir school", state);
    expect(run("ls", state)).toContain("/school");

    expect(run("clear", state)).toBe("Filesystem reset.");
    expect(run("ls", state)).toBe("(empty)");
  });
});
