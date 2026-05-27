export function normalizeUiPath(path: string): string {
  const startsAtRoot = path.startsWith("/");
  const segments: string[] = [];

  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") {
      continue;
    }

    if (segment === "..") {
      segments.pop();
      continue;
    }

    segments.push(segment);
  }

  if (startsAtRoot) {
    return segments.length === 0 ? "/" : `/${segments.join("/")}`;
  }

  return segments.join("/");
}

export function resolveUiPath(path: string, cwd: string): string {
  if (path.startsWith("/")) {
    return normalizeUiPath(path);
  }

  return joinUiPath(cwd, path);
}

export function joinUiPath(parent: string, child: string): string {
  const normalizedParent = normalizeUiPath(parent);

  if (child.startsWith("/")) {
    return normalizeUiPath(child);
  }

  if (child === "") {
    return normalizedParent || "/";
  }

  if (normalizedParent === "/" || normalizedParent === "") {
    return normalizeUiPath(`/${child}`);
  }

  return normalizeUiPath(`${normalizedParent}/${child}`);
}

export function getBaseName(path: string): string {
  const normalized = normalizeUiPath(path);
  const segments = normalized.split("/").filter(Boolean);

  return segments.at(-1) ?? "";
}

export function getParentPath(path: string, cwd: string): string {
  const resolved = resolveUiPath(path, cwd);
  const segments = resolved.split("/").filter(Boolean);

  segments.pop();

  return segments.length === 0 ? "/" : `/${segments.join("/")}`;
}
