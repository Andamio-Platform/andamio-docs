/**
 * Path containment helpers for the public API routes.
 *
 * Some /api routes build filesystem paths out of request input, such as the
 * `[deployment]` dynamic segment. Those values used to reach `readFileSync`/`readdirSync`
 * unvalidated, so `?file=../../../../package.json` escaped the public
 * directory and returned arbitrary file contents. These routes are CORS
 * enabled and served on the public docs site.
 *
 * The defence is two layers, both of which must hold:
 *   1. validate each caller-supplied segment (assertSafeSegment)
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
 * A single path segment supplied by a caller, such as a deployment name.
 * Deliberately strict: alphanumerics plus dot, dash and underscore. That
 * covers every real value ("preprod-v2", "mainnet-v2") while rejecting separators, NUL bytes, `..`, and
 * absolute or Windows-drive prefixes.
 */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export function assertSafeSegment(value: string, label: string): string {
  if (!value || !SAFE_SEGMENT.test(value) || value === "." || value === "..") {
    throw new UnsafePathError(`Invalid ${label}`);
  }
  return value;
}

/** True when the error came from these helpers, so routes can answer 400. */
export function isUnsafePathError(error: unknown): boolean {
  return error instanceof UnsafePathError;
}
