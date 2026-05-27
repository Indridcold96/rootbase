import type { FileSystemSnapshot, FilesystemCommand, FilesystemCommandResult } from "./types";

const API_PATH = "/api/fs";

export async function getFilesystemSnapshot(): Promise<FileSystemSnapshot> {
  const response = await fetch(API_PATH, { cache: "no-store" });
  return readJsonResponse<FileSystemSnapshot>(response);
}

export async function executeFilesystemCommand(command: FilesystemCommand): Promise<FilesystemCommandResult> {
  const response = await fetch(API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  return readJsonResponse<FilesystemCommandResult>(response);
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();

  if (!response.ok) {
    throw new Error(readApiError(data));
  }

  return data as T;
}

function readApiError(data: unknown): string {
  if (typeof data === "object" && data !== null && "error" in data) {
    const error = data.error;
    if (typeof error === "string") {
      return error;
    }
  }

  return "Request failed";
}
