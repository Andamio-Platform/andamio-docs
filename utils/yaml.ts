'use server';

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { PUBLIC_ROOT, UnsafePathError } from './safe-path';

/**
 * Load a YAML file from the public directory
 * @param filePath Path to the YAML file relative to the public directory
 * @returns Parsed YAML content with the specified type
 * @throws UnsafePathError if filePath resolves outside public/
 *
 * The containment check is inlined rather than delegated to
 * resolveInPublic() so that static analysis can see the guard adjacent to
 * the readFileSync it protects; across a function boundary CodeQL does not
 * recognise it as a sanitizer and keeps reporting js/path-injection here.
 */
export async function loadYamlFile<T>(filePath: string): Promise<T> {
  const fullPath = path.resolve(PUBLIC_ROOT, filePath);
  if (fullPath !== PUBLIC_ROOT && !fullPath.startsWith(PUBLIC_ROOT + path.sep)) {
    throw new UnsafePathError('Resolved path escapes the public directory');
  }
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(fileContents) as T;
}
