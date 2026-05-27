import { z } from "zod";

const stringPath = z.string().min(1);

export const filesystemCommandSchema = z.discriminatedUnion("command", [
  z.object({
    command: z.literal("cd"),
    payload: z.object({ path: stringPath }),
  }),
  z.object({
    command: z.literal("mkdir"),
    payload: z.object({ path: stringPath, recursive: z.boolean().optional() }),
  }),
  z.object({
    command: z.literal("rmdir"),
    payload: z.object({ path: stringPath }),
  }),
  z.object({
    command: z.literal("touch"),
    payload: z.object({ path: stringPath }),
  }),
  z.object({
    command: z.literal("writeFile"),
    payload: z.object({ path: stringPath, content: z.string() }),
  }),
  z.object({
    command: z.literal("readFile"),
    payload: z.object({ path: stringPath }),
  }),
  z.object({
    command: z.literal("move"),
    payload: z.object({ sourcePath: stringPath, targetPath: stringPath }),
  }),
  z.object({
    command: z.literal("copy"),
    payload: z.object({ sourcePath: stringPath, targetPath: stringPath }),
  }),
  z.object({
    command: z.literal("find"),
    payload: z.object({ name: z.string().min(1), startPath: stringPath.optional() }),
  }),
  z.object({
    command: z.literal("clear"),
    payload: z.object({}).optional(),
  }),
]);

export type FilesystemCommand = z.infer<typeof filesystemCommandSchema>;
