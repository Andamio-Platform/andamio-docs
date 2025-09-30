import fs from 'fs/promises';
import path from 'path';

const API_DIR = './content/docs/api';
const SCHEMA_PATH = './data/andamio-api-gateway.json';

// Load schema and extract path-to-tags mapping
const schema = JSON.parse(await fs.readFile(SCHEMA_PATH, 'utf8'));
const pathToTags = {};

for (const [apiPath, methods] of Object.entries(schema.paths)) {
  for (const [method, spec] of Object.entries(methods)) {
    if (spec.tags) {
      pathToTags[apiPath] = spec.tags;
      break;
    }
  }
}

console.log('🏷️  Adding tags to MDX files...\n');

// Recursively find all MDX files
async function findMdxFiles(dir) {
  const files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findMdxFiles(fullPath));
    } else if (entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
      files.push(fullPath);
    }
  }

  return files;
}

const mdxFiles = await findMdxFiles(API_DIR);
console.log(`📁 Found ${mdxFiles.length} MDX files\n`);

let updated = 0;
let skipped = 0;

for (const filePath of mdxFiles) {
  let content = await fs.readFile(filePath, 'utf8');

  // Extract route from frontmatter
  const routeMatch = content.match(/route:\s*(.+)/);
  if (!routeMatch) {
    skipped++;
    continue;
  }

  const route = routeMatch[1].trim();
  const tags = pathToTags[route];

  if (!tags || tags.length === 0) {
    skipped++;
    continue;
  }

  // Check if tags already exist
  if (content.includes('tags:')) {
    skipped++;
    continue;
  }

  // Add tags to frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const tagsYaml = `tags:\n${tags.map(tag => `  - "${tag}"`).join('\n')}`;
    const newFrontmatter = `---\n${frontmatter}\n${tagsYaml}\n---`;
    content = content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);

    await fs.writeFile(filePath, content);
    updated++;

    const fileName = path.basename(filePath);
    console.log(`✅ ${fileName} - Added tags: ${tags.join(', ')}`);
  }
}

console.log(`\n✨ Complete! Updated ${updated} files, skipped ${skipped} files`);