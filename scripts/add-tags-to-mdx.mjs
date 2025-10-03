import fs from 'fs/promises';
import path from 'path';

const API_DIR = './content/docs/api';
const SCHEMA_PATH = './data/andamio-api-gateway-openapi.json';

// Load schema and extract path-to-tags and x-access-level mapping
const schema = JSON.parse(await fs.readFile(SCHEMA_PATH, 'utf8'));
const pathToTags = {};
const pathToAccessLevel = {};

for (const [apiPath, methods] of Object.entries(schema.paths)) {
  for (const [method, spec] of Object.entries(methods)) {
    if (spec.tags) {
      pathToTags[apiPath] = spec.tags;
    }
    if (spec['x-access-level']) {
      pathToAccessLevel[apiPath] = spec['x-access-level'];
    }
    if (spec.tags || spec['x-access-level']) {
      break;
    }
  }
}

console.log('🏷️  Adding tags and access levels to MDX files...\n');

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
  const accessLevel = pathToAccessLevel[route];

  if ((!tags || tags.length === 0) && !accessLevel) {
    skipped++;
    continue;
  }

  // Check if both tags and access-level already exist
  const hasTags = content.includes('tags:');
  const hasAccessLevel = content.includes('access-level:');

  if (hasTags && hasAccessLevel) {
    skipped++;
    continue;
  }

  // Add tags and access-level to frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    let additions = [];

    if (tags && tags.length > 0 && !hasTags) {
      additions.push(`tags:\n${tags.map(tag => `  - "${tag}"`).join('\n')}`);
    }

    if (accessLevel && !hasAccessLevel) {
      additions.push(`access-level: "${accessLevel}"`);
    }

    if (additions.length > 0) {
      const newFrontmatter = `---\n${frontmatter}\n${additions.join('\n')}\n---`;
      content = content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);

      await fs.writeFile(filePath, content);
      updated++;

      const fileName = path.basename(filePath);
      const updateInfo = [];
      if (tags && !hasTags) updateInfo.push(`tags: ${tags.join(', ')}`);
      if (accessLevel && !hasAccessLevel) updateInfo.push(`access-level: ${accessLevel}`);
      console.log(`✅ ${fileName} - Added ${updateInfo.join(' | ')}`);
    }
  }
}

console.log(`\n✨ Complete! Updated ${updated} files, skipped ${skipped} files`);