import { executeFilesystemCommand, getSnapshot } from "@/server/filesystem/filesystemService";
import { mapFilesystemError } from "@/server/filesystem/filesystemErrorMapper";
import { filesystemCommandSchema } from "@/server/filesystem/filesystemSchemas";

export async function GET(): Promise<Response> {
  try {
    return Response.json(getSnapshot());
  } catch (error) {
    const mapped = mapFilesystemError(error);
    return Response.json(mapped.body, { status: mapped.status });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body: unknown = await request.json();
    const command = filesystemCommandSchema.parse(body);

    return Response.json(executeFilesystemCommand(command));
  } catch (error) {
    const mapped = mapFilesystemError(error);
    return Response.json(mapped.body, { status: mapped.status });
  }
}
