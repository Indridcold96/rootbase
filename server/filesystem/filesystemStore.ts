import { InMemoryFileSystem } from "../../core/filesystem";

let filesystem = new InMemoryFileSystem();

export function getFilesystem(): InMemoryFileSystem {
  return filesystem;
}

export function resetFilesystem(): InMemoryFileSystem {
  filesystem = new InMemoryFileSystem();
  return filesystem;
}
