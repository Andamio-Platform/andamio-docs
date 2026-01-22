import fs from 'fs/promises';
import path from 'path';

const API_DIR = './content/docs/api/gateway';
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

// Helper to convert tag to directory name (lowercase, replace spaces with hyphens)
function tagToDir(tag) {
  return tag.toLowerCase().replace(/\s+/g, '-');
}

// Helper to extract operation ID from path
function pathToFileName(apiPath, method = 'post') {
  // Remove leading slash and convert to filename
  const cleaned = apiPath.replace(/^\//, '').replace(/\//g, '-');
  return `${cleaned}.mdx`;
}

// Get all MDX files in api directory (excluding meta.json and index.mdx)
const files = await fs.readdir(API_DIR);
const mdxFiles = files.filter(f => f.endsWith('.mdx') && f !== 'index.mdx');

console.log(`📁 Found ${mdxFiles.length} MDX files to organize\n`);

// Track directory structure for meta.json generation
const directoryStructure = {};

// Process each file
for (const file of mdxFiles) {
  const filePath = path.join(API_DIR, file);
  let content = await fs.readFile(filePath, 'utf8');

  // Extract route from frontmatter
  const routeMatch = content.match(/route:\s*(.+)/);
  if (!routeMatch) {
    console.log(`⚠️  Skipping ${file} - no route found`);
    continue;
  }

  const route = routeMatch[1].trim();
  const tags = pathToTags[route];

  if (!tags || tags.length === 0) {
    console.log(`⚠️  Skipping ${file} - no tags found for route ${route}`);
    continue;
  }

  // Add tags to frontmatter
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (frontmatterMatch) {
    const frontmatter = frontmatterMatch[1];
    const tagsYaml = `tags:\n${tags.map(tag => `  - "${tag}"`).join('\n')}`;
    const newFrontmatter = `---\n${frontmatter}\n${tagsYaml}\n---`;
    content = content.replace(/^---\n[\s\S]*?\n---/, newFrontmatter);
  }

  // Build directory path from tags
  const dirPath = tags.map(tagToDir).join('/');
  const targetDir = path.join(API_DIR, dirPath);
  const targetFile = path.join(targetDir, file);

  // Create directory structure
  await fs.mkdir(targetDir, { recursive: true });

  // Track for meta.json
  if (!directoryStructure[dirPath]) {
    directoryStructure[dirPath] = {
      tags,
      files: []
    };
  }
  directoryStructure[dirPath].files.push(file);

  // Write file with updated frontmatter
  await fs.writeFile(targetFile, content);

  // Remove original if it's different location
  if (filePath !== targetFile) {
    await fs.unlink(filePath);
  }

  console.log(`✅ ${file} → ${dirPath}/`);
}

console.log(`\n📝 Creating meta.json files...\n`);

// Generate meta.json for each directory
for (const [dirPath, info] of Object.entries(directoryStructure)) {
  const metaPath = path.join(API_DIR, dirPath, 'meta.json');
  const title = info.tags[info.tags.length - 1]; // Use last tag as title

  const meta = {
    title,
    pages: ['...']
  };

  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
  console.log(`✅ Created ${dirPath}/meta.json`);
}

// Update gateway meta.json to include top-level directories
const topLevelDirs = [...new Set(
  Object.keys(directoryStructure).map(p => p.split('/')[0])
)].sort();

const gatewayMeta = {
  title: "API Gateway",
  pages: ["index", ...topLevelDirs],
  defaultOpen: false
};

await fs.writeFile(
  path.join(API_DIR, 'meta.json'),
  JSON.stringify(gatewayMeta, null, 2)
);

console.log(`\n✅ Updated gateway meta.json with ${topLevelDirs.length} endpoint directories`);

// Copy schema to public directory for browser access
console.log(`\n📦 Copying schema to public directory...`);
const publicDataDir = './public/data';
await fs.mkdir(publicDataDir, { recursive: true });
await fs.copyFile(
  './data/andamio-api-gateway-openapi.json',
  './public/data/andamio-api-gateway-openapi.json'
);
console.log(`✅ Schema copied to ${publicDataDir}/andamio-api-gateway-openapi.json`);

console.log(`\n✨ Organization complete!`);