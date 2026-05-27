export class FileSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidPathError extends FileSystemError {}

export class NodeNotFoundError extends FileSystemError {}

export class NodeAlreadyExistsError extends FileSystemError {}

export class NotADirectoryError extends FileSystemError {}

export class NotAFileError extends FileSystemError {}

export class CannotRemoveRootError extends FileSystemError {}

export class DirectoryNotEmptyError extends FileSystemError {}

export class InvalidMoveOperationError extends FileSystemError {}
