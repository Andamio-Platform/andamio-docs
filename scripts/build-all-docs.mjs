#!/usr/bin/env node
/**
 * Build All Documentation
 *
 * Pulls from all API sources, updates schemas, and regenerates all documentation.
 *
 * Usage:
 *   npm run build-all-docs
 *   node scripts/build-all-docs.mjs [--skip-pull] [--skip-generate]
 *
 * Options:
 *   --skip-pull      Skip pulling API specs (use existing local copies)
 *   --skip-generate  Skip generating MDX (only pull specs)
 *
 * This script coordinates:
 *   1. Andamio API Gateway (existing)
 *   2. Andamioscan API (indexer)
 *   3. Future: Atlas Transaction Builder API
 */

import { execSync, spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

/**
 * API Sources Configuration
 *
 * Add new API sources here. Each source needs:
 * - name: Display name
 * - swaggerUrl: URL to fetch the swagger/openapi spec
 * - localPath: Where to save the downloaded spec
 * - generateScript: npm script or node command to generate docs
 * - enabled: Whether to include in build
 */
const API_SOURCES = [
  {
    name: 'Andamio API Gateway',
    swaggerUrl: 'https://andamio-api-preprod-308006323670.us-central1.run.app/api/v1/docs/doc.json',
    localPath: './data/andamio-api-gateway.json',
    generateScript: 'generate-all-api-docs',
    enabled: true,
    notes: 'Main API gateway - auth, user management, platform services'
  },
  {
    name: 'Andamioscan',
    swaggerUrl: 'https://preprod.andamioscan.andamio.space/swagger/doc.json',
    localPath: './data/andamioscan-swagger.json',
    generateScript: 'generate-andamioscan-docs',
    enabled: true,
    notes: 'Indexer API - query on-chain state and transaction history'
  },
  {
    name: 'Atlas Transaction Builder',
    swaggerUrl: 'https://atlas-api-preprod-507341199760.us-central1.run.app/swagger.json',
    localPath: './data/atlas-tx-builder-swagger.json',
    generateScript: null, // Not yet implemented
    enabled: false, // Enable when ready
    notes: 'Transaction building API - V2 tx endpoints (swagger already in public/yaml/transactions/v2/)'
  }
];

/**
 * Pull a swagger spec from a URL
 */
async function pullSpec(source) {
  console.log(`\n📥 Pulling ${source.name}...`);
  console.log(`   URL: ${source.swaggerUrl}`);

  try {
    const response = await fetch(source.swaggerUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const spec = await response.json();
    const fullPath = path.join(ROOT_DIR, source.localPath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, JSON.stringify(spec, null, 2));

    const endpoints = Object.keys(spec.paths || {}).length;
    console.log(`   ✅ Saved to ${source.localPath} (${endpoints} endpoints)`);
    return true;
  } catch (error) {
    console.error(`   ❌ Failed: ${error.message}`);
    return false;
  }
}

/**
 * Run a npm script
 */
function runScript(scriptName) {
  return new Promise((resolve, reject) => {
    console.log(`\n🔧 Running: npm run ${scriptName}`);

    const child = spawn('npm', ['run', scriptName], {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

/**
 * Print summary of what will be built
 */
function printSummary() {
  console.log('\n📋 API Sources:');
  console.log('─'.repeat(60));

  for (const source of API_SOURCES) {
    const status = source.enabled ? '✅' : '⏸️ ';
    const generate = source.generateScript ? `→ ${source.generateScript}` : '(no generator)';
    console.log(`${status} ${source.name}`);
    console.log(`      ${source.notes}`);
    if (source.enabled) {
      console.log(`      ${generate}`);
    }
  }

  console.log('─'.repeat(60));
}

/**
 * Main build process
 */
async function main() {
  const args = process.argv.slice(2);
  const skipPull = args.includes('--skip-pull');
  const skipGenerate = args.includes('--skip-generate');

  console.log('🚀 Building All Documentation\n');
  console.log(`   Skip pull: ${skipPull}`);
  console.log(`   Skip generate: ${skipGenerate}`);

  printSummary();

  const enabledSources = API_SOURCES.filter(s => s.enabled);

  // Step 1: Pull all specs
  if (!skipPull) {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 1: Pulling API Specifications');
    console.log('='.repeat(60));

    const pullResults = [];
    for (const source of enabledSources) {
      const success = await pullSpec(source);
      pullResults.push({ source, success });
    }

    const failed = pullResults.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('\n⚠️  Some specs failed to pull:');
      for (const { source } of failed) {
        console.log(`   - ${source.name}`);
      }
    }
  }

  // Step 2: Generate documentation
  if (!skipGenerate) {
    console.log('\n' + '='.repeat(60));
    console.log('STEP 2: Generating Documentation');
    console.log('='.repeat(60));

    for (const source of enabledSources) {
      if (source.generateScript) {
        try {
          await runScript(source.generateScript);
          console.log(`   ✅ ${source.name} docs generated`);
        } catch (error) {
          console.error(`   ❌ ${source.name} failed: ${error.message}`);
        }
      }
    }
  }

  // Step 3: Verify build
  console.log('\n' + '='.repeat(60));
  console.log('STEP 3: Verifying Documentation');
  console.log('='.repeat(60));

  const verifyPaths = [
    { path: 'content/docs/api/index.mdx', desc: 'API index' },
    { path: 'content/docs/api/andamioscan/index.mdx', desc: 'Andamioscan index' },
    { path: 'content/docs/protocol/v2/transactions/index.mdx', desc: 'V2 transactions index' },
    { path: 'data/andamio-api-gateway.json', desc: 'API Gateway spec' },
    { path: 'data/andamioscan-swagger.json', desc: 'Andamioscan spec' },
  ];

  for (const { path: filePath, desc } of verifyPaths) {
    const fullPath = path.join(ROOT_DIR, filePath);
    try {
      await fs.access(fullPath);
      console.log(`   ✅ ${desc}`);
    } catch {
      console.log(`   ❌ ${desc} - missing!`);
    }
  }

  console.log('\n✨ Documentation build complete!');
  console.log('\nNext steps:');
  console.log('  npm run dev     # Start dev server to preview');
  console.log('  npm run build   # Build for production');
}

main().catch(error => {
  console.error('\n❌ Build failed:', error.message);
  process.exit(1);
});
