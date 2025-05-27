import { generateFiles } from 'fumadocs-openapi';
import fs from 'fs';

// Log the current working directory to understand where we are
console.log('Current working directory:', process.cwd());

// First, ensure the target directory exists
const targetDir = './content/docs/apis/reference';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

void generateFiles({
  // Path to your OpenAPI schema
  input: ['./data/express-openapi.yaml'],
  // Output directory for generated MDX files - using a simple relative path
  output: targetDir,
  // Include endpoint descriptions
  includeDescription: true,
  // Group endpoints by tags
  groupByTags: true,
  // Use tag groups defined in x-tagGroups
  useTagGroups: true,
  // Add a badge to each endpoint
  addBadges: true,
});