/**
 * Path containment helpers for the public API routes.
 *
 * Several /api routes build filesystem paths out of request input — query
 * params (`file`, `version`, `deployment`) and dynamic segments (`[role]`,
 * `[transaction]`). Those values used to reach `readFileSync`/`readdirSync`
 * unvalidated, so `?file=../../../../package.json` escaped the public
 * directory and returned arbitrary file contents. These routes are CORS
 * enabled and served on the public docs site.
 *
 * The defence is two layers, both of which must hold:
 *   1. validate each caller-supplied segment (assertSafeSegment / …Path)
 *   2. resolve the final path and assert it is still inside public/ before
 *      touching the filesystem
 *
 * Layer 2 is the backstop: even if a new route forgets to validate, the
 * resolved path is checked against the public root. That check is written
 * inline next to each read (a locally resolved public root, then a
 * startsWith check right before the read; see utils/yaml.ts), not as a helper
 * here, because CodeQL's js/path-injection rule only recognises that shape.
 */

export class UnsafePathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsafePathError";
  }
}

/**
 * A single path segment supplied by a caller — a role, a version, a
 * deployment, a filename. Deliberately strict: alphanumerics plus dot, dash
 * and underscore. That covers every real value ("v2", "preprod-v2", "course",
 * "assignment-commit.yaml") while rejecting separators, NUL bytes, `..`, and
 * absolute or Windows-drive prefixes.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export function assertSafeSegment(value: string, label: string): string {
  if (!value || !SAFE_SEGMENT.test(value) || value === "." || value === "..") {
    throw new UnsafePathError(`Invalid ${label}`);
  }
  return value;
}

/**
 * A caller-supplied relative path that may legitimately contain slashes —
 * e.g. the `file` param, "course/student/assignment-commit.yaml". Every
 * segment must independently be safe, so no component can be `..`.
 */
export function assertSafeRelativePath(value: string, label: string): string {
  if (!value || value.startsWith("/") || value.includes("\0")) {
    throw new UnsafePathError(`Invalid ${label}`);
  }
  const segments = value.split("/").filter((s) => s.length > 0);
  if (segments.length === 0) {
    throw new UnsafePathError(`Invalid ${label}`);
  }
  for (const segment of segments) {
    assertSafeSegment(segment, label);
  }
  return segments.join("/");
}

/** True when the error came from these helpers, so routes can answer 400. */
export function isUnsafePathError(error: unknown): boolean {
  return error instanceof UnsafePathError;
}
