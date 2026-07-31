'use server';

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { UnsafePathError } from './safe-path';

/**
 * Load a YAML file from the public directory
 * @param filePath Path to the YAML file relative to the public directory
 * @returns Parsed YAML content with the specified type
 * @throws UnsafePathError if filePath resolves outside public/
 *
 * The root is derived locally and the containment check sits directly above
 * the readFileSync it guards. Both details are deliberate: CodeQL only
 * treats this as a sanitizer for js/path-injection when the prefix is a
 * locally-resolved constant and the check is adjacent to the sink.
 */
export async function loadYamlFile<T>(filePath: string): Promise<T> {
  const publicRoot = path.resolve(process.cwd(), 'public');
  const fullPath = path.resolve(publicRoot, filePath);

  if (!fullPath.startsWith(publicRoot + path.sep)) {
    throw new UnsafePathError('Resolved path escapes the public directory');
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(fileContents) as T;
}
