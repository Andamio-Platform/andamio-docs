'use server';

import fs from 'fs';
import yaml from 'js-yaml';
import { resolveInPublic } from './safe-path';

/**
 * Load a YAML file from the public directory
 * @param filePath Path to the YAML file relative to the public directory
 * @returns Parsed YAML content with the specified type
 * @throws UnsafePathError if filePath resolves outside public/
 */
export async function loadYamlFile<T>(filePath: string): Promise<T> {
  const fullPath = resolveInPublic(filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(fileContents) as T;
}
