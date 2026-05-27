# Rootbase

An in-memory filesystem explorer built with TypeScript and Next.js.

## Overview

Rootbase is an in-memory filesystem implementation for files and directories. The filesystem core is a framework-agnostic TypeScript library, and the CLI plus browser explorer are adapters over that same core.

Virtual filesystem operations do not use the real disk filesystem. All state lives in memory and resets when the owning process restarts.

The browser explorer is an extension over the core filesystem, not the source of filesystem behavior.

## Features

- Directories and files
- Current working directory
- Absolute and relative paths
- `.` and `..`
- Create/remove directories
- Create/delete files
- Read/write file contents
- Move/rename/copy files and directories
- Recursive find by exact name
- Tree walking
- Demo script
- Interactive CLI
- Browser file explorer
- Browser theme toggle
- Sample filesystem loader
- Backend API with Zod validation
- In-memory server-side state

## Architecture

`core/filesystem` contains the pure TypeScript filesystem implementation. It does not import Next.js, React, Node `fs`, browser APIs, persistence, or API route code.

`cli` is an interactive command-line adapter over the core. It owns its own in-memory filesystem instance for the lifetime of the CLI process.

`server/filesystem` is the backend adapter over the core. It owns a singleton in-memory filesystem instance, validates API commands with Zod, builds snapshots, and maps errors into API responses.

`web/filesystem` contains frontend API helpers and small UI-only path composition helpers.

`components` contains both generated shadcn/ui primitives under `components/ui` and Rootbase-specific browser explorer components under `components/screens` and `components/file-explorer`. React components do not import or instantiate the filesystem core.

`app/api/fs` is a thin Next.js route that delegates to `server/filesystem`.

`app/page.tsx` is a thin page that renders the Rootbase explorer screen.

## Project Structure

```text
core/filesystem/        # framework-agnostic filesystem core
cli/                    # interactive CLI adapter
scripts/                # demo scripts
server/filesystem/      # backend adapter, Zod schemas, service, error mapping
web/filesystem/         # frontend API client and UI helpers
components/             # shadcn/ui primitives and Rootbase browser explorer components
app/                    # Next.js app routes, layout, and thin explorer page
app/api/fs/             # Next.js API route
tests/                  # unit tests
```

## Getting Started

```bash
npm install
```

## Available Commands

```bash
npm test
```

Runs the Vitest test suite.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

```bash
npm run test:e2e
```

Runs the Playwright browser smoke test.

```bash
npm run test:e2e:ui
```

Runs Playwright in UI mode.

```bash
npm run demo:core
```

Runs the scripted filesystem demo against the real `InMemoryFileSystem`.

```bash
npm run cli
```

Starts the interactive CLI.

```bash
npm run dev
```

Starts the Next.js browser explorer at `http://localhost:3000`.

```bash
npm run build
```

Builds the Next.js app.

```bash
npm run lint
```

Runs ESLint.

## Running the Core Demo

```bash
npm run demo:core
```

The demo runs a scripted sequence against the real `InMemoryFileSystem`, prints directory listings, reads a file, and prints the final virtual filesystem tree.

It does not create real folders or files on disk.

## Running the CLI

```bash
npm run cli
```

Supported commands:

- `help`
- `pwd`
- `ls [path]`
- `cd <path>`
- `mkdir <path> [--recursive]`
- `rmdir <path>`
- `touch <path>`
- `rm <path>`
- `write <path> <content...>`
- `read <path>`
- `mv <source> <target>`
- `cp <source> <target>`
- `find <name> [startPath]`
- `tree [path]`
- `clear`
- `exit` / `quit`

Example session:

```text
mkdir school
cd school
mkdir homework
cd homework
touch notes.txt
write notes.txt hello from rootbase
read notes.txt
tree /
exit
```

## Running the Browser Explorer

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The browser explorer calls `/api/fs`. The backend wraps the in-memory core and is the source of truth for filesystem state. Browser refreshes fetch the current backend snapshot; the browser does not hold filesystem state as the source of truth.

The explorer includes a light/dark/system theme toggle and a reset-with-sample action for quickly loading a deterministic demo filesystem.

Restarting the dev server resets the filesystem state.

## API Summary

### `GET /api/fs`

Returns a filesystem snapshot:

- `cwd`
- `tree`
- `entries`

### `POST /api/fs`

Accepts command payloads:

- `cd`
- `mkdir`
- `rmdir`
- `touch`
- `deleteFile`
- `writeFile`
- `readFile`
- `move`
- `copy`
- `find`
- `clear`
- `seedExample`

Example:

```json
{
  "command": "mkdir",
  "payload": {
    "path": "/school/homework",
    "recursive": true
  }
}
```

## Design Decisions

Rootbase is in-memory only by design. It is intended to demonstrate filesystem behavior without persistence or disk writes.

The core is a framework-agnostic TypeScript library. This keeps filesystem behavior independent from Next.js, React, CLI code, API routes, and browser state.

Directories use `Map<string, FileSystemNode>` for children, which keeps child lookup simple and efficient.

Directory listings and search results are sorted deterministically so tests, demos, CLI output, and UI rendering remain stable.

The core uses explicit custom errors for invalid filesystem operations. Adapters catch those errors and present readable messages.

The CLI and web layers are thin adapters. They call the core or backend service instead of duplicating filesystem behavior.

Zod validation lives at the API boundary, not in the core.

The browser is not the source of truth. It fetches snapshots and sends commands to the backend API, which wraps the in-memory filesystem instance.

## Limitations

- No persistence
- No real disk writes
- No permissions or users
- No symlinks or hardlinks
- No file streaming
- State resets on process restart
- The in-memory singleton is appropriate for local and take-home usage, not distributed deployment

## Testing

The test suite covers:

- Core filesystem behavior
- CLI parser and command handlers
- Server filesystem service helpers
- Web path helper functions

Run all tests with:

```bash
npm test
```

## Optional E2E Smoke Test

Install the Chromium browser used by Playwright:

```bash
npx playwright install chromium
```

Then run the browser smoke test:

```bash
npm run test:e2e
```
