import { describe, expect, it } from "vitest";
import {
  getBaseName,
  getParentPath,
  joinUiPath,
  normalizeUiPath,
  resolveUiPath,
} from "../../web/filesystem/pathHelpers";

const cwd = "/Material-Security/test";

describe("UI path helpers", () => {
  it("normalizes repeated slashes while preserving root", () => {
    expect(normalizeUiPath("/school//homework/")).toBe("/school/homework");
    expect(normalizeUiPath("/")).toBe("/");
    expect(normalizeUiPath("interior//test.csv")).toBe("interior/test.csv");
  });

  it("resolves relative paths against the current directory", () => {
    expect(resolveUiPath("test.csv", cwd)).toBe("/Material-Security/test/test.csv");
    expect(resolveUiPath("../report.csv", cwd)).toBe("/Material-Security/report.csv");
    expect(resolveUiPath("/archive", cwd)).toBe("/archive");
  });

  it("joins parent and child paths for command composition", () => {
    expect(joinUiPath("/archive", "test.csv")).toBe("/archive/test.csv");
    expect(joinUiPath(cwd, "interior/test.csv")).toBe("/Material-Security/test/interior/test.csv");
    expect(joinUiPath("/", "test.csv")).toBe("/test.csv");
  });

  it("gets basename from relative and absolute paths", () => {
    expect(getBaseName("test.csv")).toBe("test.csv");
    expect(getBaseName("/Material-Security/test/folder")).toBe("folder");
  });

  it("gets parent path using the current directory for relative paths", () => {
    expect(getParentPath("test.csv", cwd)).toBe("/Material-Security/test");
    expect(getParentPath("/Material-Security/test/test.csv", cwd)).toBe("/Material-Security/test");
  });
});
