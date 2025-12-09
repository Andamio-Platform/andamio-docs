#!/usr/bin/env node
/**
 * Andamioscan API Documentation Generator
 *
 * Pulls the latest swagger spec from Andamioscan and generates MDX documentation.
 *
 * Usage:
 *   npm run generate-andamioscan-docs
 *   node scripts/generate-andamioscan-docs.mjs [--pull] [--generate]
 *
 * Options:
 *   --pull      Only pull the swagger spec (skip generation)
 *   --generate  Only generate docs (skip pulling)
 *   (default)   Both pull and generate
 */

import { generateFiles } from 'fumadocs-openapi';
import converter from 'swagger2openapi';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Configuration
const CONFIG = {
  // Swagger source
  swaggerUrl: 'https://preprod.andamioscan.andamio.space/swagger/doc.json',
  swaggerUiUrl: 'https://preprod.andamioscan.andamio.space/swagger/index.html',

  // Local paths (relative for fumadocs-openapi compatibility)
  swaggerPath: './data/andamioscan-swagger.json',
  openapiPath: './data/andamioscan-openapi.json',
  publicPath: './public/data/andamioscan-openapi.json',
  outputDir: './content/docs/api/andamioscan',

  // Absolute paths for fs operations
  swaggerPathAbs: path.join(ROOT_DIR, 'data/andamioscan-swagger.json'),
  openapiPathAbs: path.join(ROOT_DIR, 'data/andamioscan-openapi.json'),
  publicPathAbs: path.join(ROOT_DIR, 'public/data/andamioscan-openapi.json'),
  outputDirAbs: path.join(ROOT_DIR, 'content/docs/api/andamioscan'),

  // API info
  baseUrl: 'https://preprod.andamioscan.andamio.space',
  environment: 'preprod',
  version: '1.0',
};

/**
 * Cross-reference mapping between Andamioscan transaction types and V2 documentation
 *
 * UPDATE THIS when:
 * - New transaction types are added to Andamioscan
 * - V2 transaction documentation paths change
 * - New cross-references are needed
 */
const CROSS_REFERENCES = {
  // Andamioscan transaction type -> V2 docs path
  transactionTypes: {
    'UserAccessTokenMint': '/docs/protocol/v2/transactions/general/mint-access-token',
    'AdminCourseCreate': '/docs/protocol/v2/transactions/course/admin/create',
    'AdminCourseTeachersUpdate': '/docs/protocol/v2/transactions/course/admin/teachers-update',
    'StudentCourseEnroll': '/docs/protocol/v2/transactions/course/student/enroll',
    'StudentCourseAssignmentSubmit': '/docs/protocol/v2/transactions/course/student/enroll', // commit at enrollment
    'StudentCourseAssignmentUpdate': '/docs/protocol/v2/transactions/course/student/assignment-update',
    'StudentCourseCredentialClaim': '/docs/protocol/v2/transactions/course/student/credential-claim',
    'TeacherCourseAssignmentsAssess': '/docs/protocol/v2/transactions/course/teacher/assignments-assess',
    'TeacherCourseModulesManage': '/docs/protocol/v2/transactions/course/teacher/modules-manage',
  },

  // Andamioscan endpoint patterns -> V2 docs path
  endpoints: {
    '/v2/transactions/useraccesstoken/mint': '/docs/protocol/v2/transactions/general/mint-access-token',
    '/v2/transactions/admincourse/create': '/docs/protocol/v2/transactions/course/admin/create',
    '/v2/transactions/admincourse/teachers_update': '/docs/protocol/v2/transactions/course/admin/teachers-update',
    '/v2/transactions/studentcourse/enroll': '/docs/protocol/v2/transactions/course/student/enroll',
    '/v2/transactions/studentcourse/assignment_submit': '/docs/protocol/v2/transactions/course/student/enroll',
    '/v2/transactions/studentcourse/assignment_update': '/docs/protocol/v2/transactions/course/student/assignment-update',
    '/v2/transactions/studentcourse/credential_claim': '/docs/protocol/v2/transactions/course/student/credential-claim',
    '/v2/transactions/teachercourse/assignments_assess': '/docs/protocol/v2/transactions/course/teacher/assignments-assess',
    '/v2/transactions/teachercourse/modules_manage': '/docs/protocol/v2/transactions/course/teacher/modules-manage',
  },

  // Related documentation sections
  related: {
    transactions: '/docs/protocol/v2/transactions',
    costs: '/docs/protocol/v2/cost-estimation',
    whatsNew: '/docs/protocol/v2/whats-new',
  }
};

/**
 * Pull the latest swagger spec from Andamioscan
 */
async function pullSwagger() {
  console.log('📥 Pulling Andamioscan swagger spec...');
  console.log(`   Source: ${CONFIG.swaggerUrl}`);

  try {
    const response = await fetch(CONFIG.swaggerUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const swagger = await response.json();
    await fs.writeFile(CONFIG.swaggerPathAbs, JSON.stringify(swagger, null, 2));

    console.log(`   ✅ Saved to: ${CONFIG.swaggerPath}`);
    console.log(`   📊 Endpoints: ${Object.keys(swagger.paths || {}).length}`);
    console.log(`   📦 Models: ${Object.keys(swagger.definitions || {}).length}`);

    return swagger;
  } catch (error) {
    console.error(`   ❌ Failed to pull swagger: ${error.message}`);
    throw error;
  }
}

/**
 * Convert Swagger 2.0 to OpenAPI 3.0
 */
async function convertToOpenAPI(swagger) {
  console.log('\n🔄 Converting Swagger 2.0 to OpenAPI 3.0...');

  return new Promise((resolve, reject) => {
    converter.convertObj(swagger, { patch: true, warnOnly: true }, (err, result) => {
      if (err) {
        reject(err);
        return;
      }

      const openapi = result.openapi;

      // Add servers field for interactive docs
      openapi.servers = [
        {
          url: CONFIG.baseUrl,
          description: `Andamioscan API (${CONFIG.environment})`
        }
      ];

      // Clean up model names (remove internal package paths)
      if (openapi.components?.schemas) {
        const cleanedSchemas = {};
        for (const [key, value] of Object.entries(openapi.components.schemas)) {
          // Convert "github_com_nelsonksh_andamioscan_internal_api_dto.ErrorResponse" to "ErrorResponse"
          const cleanKey = key.split('.').pop();
          cleanedSchemas[cleanKey] = value;

          // Also fix any $ref references in the schema
          const schemaStr = JSON.stringify(value);
          const cleanedStr = schemaStr.replace(
            /#\/components\/schemas\/[^"]+\./g,
            '#/components/schemas/'
          );
          cleanedSchemas[cleanKey] = JSON.parse(cleanedStr);
        }
        openapi.components.schemas = cleanedSchemas;
      }

      // Fix $ref references in paths
      const pathsStr = JSON.stringify(openapi.paths);
      const cleanedPathsStr = pathsStr.replace(
        /#\/components\/schemas\/[^"]+\./g,
        '#/components/schemas/'
      );
      openapi.paths = JSON.parse(cleanedPathsStr);

      console.log(`   ✅ Converted to OpenAPI ${openapi.openapi}`);
      console.log(`   🌐 Server: ${openapi.servers[0].url}`);

      resolve(openapi);
    });
  });
}

/**
 * Generate MDX documentation from OpenAPI spec
 */
async function generateDocs(openapi) {
  console.log('\n📝 Generating MDX documentation...');

  // Save OpenAPI spec for fumadocs (use absolute path for fs operations)
  await fs.writeFile(CONFIG.openapiPathAbs, JSON.stringify(openapi, null, 2));
  console.log(`   💾 Saved OpenAPI spec: ${CONFIG.openapiPath}`);

  // Copy to public for browser access
  await fs.mkdir(path.dirname(CONFIG.publicPathAbs), { recursive: true });
  await fs.writeFile(CONFIG.publicPathAbs, JSON.stringify(openapi, null, 2));
  console.log(`   📂 Copied to public: ${CONFIG.publicPath}`);

  // Ensure output directory exists
  await fs.mkdir(CONFIG.outputDirAbs, { recursive: true });

  // Generate MDX files (use relative paths for fumadocs-openapi)
  await generateFiles({
    input: [CONFIG.openapiPath],
    output: CONFIG.outputDir,
    includeDescription: true,
    groupByTags: true,
    useTagGroups: true,
    addBadges: true,
  });

  console.log(`   ✅ Generated docs in: ${CONFIG.outputDir}`);

  // List generated files
  const files = await fs.readdir(CONFIG.outputDirAbs);
  console.log(`   📄 Files: ${files.length}`);
}

/**
 * Build transaction types table with cross-references
 */
function buildTransactionTypesTable() {
  const rows = Object.entries(CROSS_REFERENCES.transactionTypes).map(([type, docPath]) => {
    const description = type
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace('User Access Token Mint', 'Protocol entry - mint access token')
      .replace('Admin Course Create', 'Admin creates a course')
      .replace('Admin Course Teachers Update', 'Admin updates course teachers')
      .replace('Student Course Enroll', 'Student enrolls in course')
      .replace('Student Course Assignment Submit', 'Student submits assignment')
      .replace('Student Course Assignment Update', 'Student updates submission')
      .replace('Student Course Credential Claim', 'Student claims credential')
      .replace('Teacher Course Assignments Assess', 'Teacher assesses assignments')
      .replace('Teacher Course Modules Manage', 'Teacher manages modules');

    return `| \`${type}\` | ${description} | [View →](${docPath}) |`;
  });

  return `| Type | Description | V2 Docs |
|------|-------------|---------|
${rows.join('\n')}`;
}

/**
 * Build endpoint table with cross-references
 */
function buildEndpointTable() {
  const rows = Object.entries(CROSS_REFERENCES.endpoints).map(([endpoint, docPath]) => {
    const description = endpoint
      .replace('/v2/transactions/', '')
      .replace('useraccesstoken/mint', 'Access token mint')
      .replace('admincourse/create', 'Course creation')
      .replace('admincourse/teachers_update', 'Teacher update')
      .replace('teachercourse/modules_manage', 'Module management')
      .replace('teachercourse/assignments_assess', 'Assignment assessment')
      .replace('studentcourse/enroll', 'Enrollment')
      .replace('studentcourse/assignment_submit', 'Assignment submission')
      .replace('studentcourse/assignment_update', 'Assignment update')
      .replace('studentcourse/credential_claim', 'Credential claim');

    return `| \`${endpoint}/{tx_hash}\` | ${description} | [V2 Docs](${docPath}) |`;
  });

  return `| Endpoint | Description | Related |
|----------|-------------|---------|
${rows.join('\n')}`;
}

/**
 * Create index page for Andamioscan section
 */
async function createIndexPage() {
  const txTypesTable = buildTransactionTypesTable();
  const endpointTable = buildEndpointTable();

  const indexContent = `---
title: Andamioscan API
description: Indexer API for querying Andamio on-chain data
---

# Andamioscan API

**Version:** ${CONFIG.version}
**Environment:** ${CONFIG.environment}

Andamioscan is the indexer for Andamio Protocol on-chain data. It provides read-only access to indexed blockchain state including courses, students, modules, and transaction history.

**Base URL:** \`${CONFIG.baseUrl}\`

<Callout type="info">
Andamioscan will be integrated into the unified Andamio API in a future release. The current endpoints are accessible directly at the base URL above.
</Callout>

## API Categories

### Courses

Query course data and enrolled students:

- \`GET /v2/courses\` - List all courses
- \`GET /v2/courses/{course_id}\` - Get specific course
- \`GET /v2/courses/{course_id}/students\` - Get students in a course
- \`GET /v2/courses/{course_id}/students/{alias}\` - Get specific student

### Transactions

Query indexed transactions:

- \`GET /v2/transactions\` - List transactions (filter by type)
- \`GET /v2/transactions/count\` - Get transaction counts by type
- \`GET /v2/transactions/{tx_hash}\` - Get transaction by hash

### Transaction Detail Endpoints

Get decoded transaction data by type. Each endpoint links to the corresponding V2 protocol documentation:

${endpointTable}

### Users

Query user global state:

- \`GET /v2/user/all\` - List all users
- \`GET /v2/user/global-state/{alias}\` - Get user's global state with courses

## Transaction Types

When filtering transactions via \`GET /v2/transactions?type=...\`, use these type values:

${txTypesTable}

## Swagger UI

Interactive API documentation is available at:
[${CONFIG.swaggerUiUrl}](${CONFIG.swaggerUiUrl})

## Related Documentation

- [V2 Transaction Documentation](${CROSS_REFERENCES.related.transactions}) - How V2 transactions work on-chain
- [V2 Cost Estimation](${CROSS_REFERENCES.related.costs}) - Transaction costs and fee structures
- [What's New in V2](${CROSS_REFERENCES.related.whatsNew}) - Protocol changes and improvements
`;

  const indexPath = path.join(CONFIG.outputDirAbs, 'index.mdx');
  await fs.writeFile(indexPath, indexContent);
  console.log(`\n📋 Created index page: ${CONFIG.outputDir}/index.mdx`);
}

/**
 * Create/update meta.json for navigation
 */
async function updateMetaJson() {
  // Get list of generated files and directories (excluding index)
  const entries = await fs.readdir(CONFIG.outputDirAbs, { withFileTypes: true });

  // Collect both directories and MDX files
  const pages = ['index'];

  // Add directories first (these are tag-based groups from fumadocs)
  for (const entry of entries) {
    if (entry.isDirectory()) {
      pages.push(entry.name);
    }
  }

  // Add top-level MDX files (excluding index)
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.mdx') && entry.name !== 'index.mdx') {
      pages.push(entry.name.replace('.mdx', ''));
    }
  }

  const meta = {
    title: 'Andamioscan',
    pages
  };

  const metaPath = path.join(CONFIG.outputDirAbs, 'meta.json');
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
  console.log(`📑 Updated meta.json with ${pages.length} pages`);
}

/**
 * Update parent API meta.json to include andamioscan
 */
async function updateParentMeta() {
  const parentMetaPath = path.join(ROOT_DIR, 'content/docs/api/meta.json');

  try {
    const content = await fs.readFile(parentMetaPath, 'utf8');
    const meta = JSON.parse(content);

    if (!meta.pages.includes('andamioscan')) {
      // Add andamioscan after the index
      const indexPos = meta.pages.indexOf('index');
      if (indexPos >= 0) {
        meta.pages.splice(indexPos + 1, 0, 'andamioscan');
      } else {
        meta.pages.push('andamioscan');
      }

      await fs.writeFile(parentMetaPath, JSON.stringify(meta, null, 2) + '\n');
      console.log(`📑 Added 'andamioscan' to parent meta.json`);
    }
  } catch (error) {
    console.log(`⚠️  Could not update parent meta.json: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const pullOnly = args.includes('--pull');
  const generateOnly = args.includes('--generate');

  console.log('🔧 Andamioscan Documentation Generator\n');

  let swagger;

  // Pull swagger spec
  if (!generateOnly) {
    swagger = await pullSwagger();
  } else {
    // Load existing swagger
    const content = await fs.readFile(CONFIG.swaggerPathAbs, 'utf8');
    swagger = JSON.parse(content);
    console.log(`📂 Using existing swagger from: ${CONFIG.swaggerPath}`);
  }

  // Generate docs
  if (!pullOnly) {
    const openapi = await convertToOpenAPI(swagger);
    await generateDocs(openapi);
    await createIndexPage();
    await updateMetaJson();
    await updateParentMeta();
  }

  console.log('\n✨ Done!');
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
