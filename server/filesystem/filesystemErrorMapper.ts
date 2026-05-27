import { FileSystemError } from "../../core/filesystem";
import { ZodError } from "zod";

export interface ApiErrorBody {
  error: string;
}

export interface MappedError {
  status: number;
  body: ApiErrorBody;
}

export function mapFilesystemError(error: unknown): MappedError {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: { error: `Invalid request: ${error.issues.map((issue) => issue.message).join("; ")}` },
    };
  }

  if (error instanceof FileSystemError) {
    return {
      status: 400,
      body: { error: error.message },
    };
  }

  if (error instanceof Error) {
    return {
      status: 500,
      body: { error: error.message || "Unexpected server error" },
    };
  }

  return {
    status: 500,
    body: { error: "Unexpected server error" },
  };
}
