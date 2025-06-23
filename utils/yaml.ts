'use server';

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/**
 * Load a YAML file from the public directory
 * @param filePath Path to the YAML file relative to the public directory
 * @returns Parsed YAML content with the specified type
 */
export async function loadYamlFile<T>(filePath: string): Promise<T> {
  const fullPath = path.join(process.cwd(), 'public', filePath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  return yaml.load(fileContents) as T;
}
