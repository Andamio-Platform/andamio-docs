import { generateFiles } from 'fumadocs-openapi';
import converter from 'swagger2openapi';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration for API documentation generation
const API_CONFIGS = [
  {
    input: './data/andamio-api-gateway.json',
    output: './content/docs/api/gateway',
    isOpenAPI: false, // Swagger 2.0, needs conversion
  },
  // Legacy schemas - commented out, only using andamio-api-gateway now
  // {
  //   input: './data/express-openapi.yaml',
  //   output: './content/docs/api/reference',
  //   isOpenAPI: true, // Already OpenAPI 3.0+
  // },
  // {
  //   input: './data/example-swagger.json',
  //   output: './content/docs/api/example',
  //   isOpenAPI: false, // Swagger 2.0, needs conversion
  // },
  // Add more API configs here as needed
];

// Source of truth for Andamio API Gateway URL
const ANDAMIO_API_GATEWAY_URL = 'https://dev.api.andamio.io/api/v1';

async function convertSwaggerToOpenAPI(inputPath) {
  const swaggerContent = await fs.readFile(inputPath, 'utf8');
  const swaggerDoc = JSON.parse(swaggerContent);

  return new Promise((resolve, reject) => {
    converter.convertObj(swaggerDoc, { patch: true, warnOnly: true }, (err, result) => {
      if (err) reject(err);
      else {
        const openapi = result.openapi;

        // Always set servers field to the canonical dev-api.andamio.io URL
        // This ensures the proxy works correctly regardless of what's in the source swagger
        openapi.servers = [
          {
            url: ANDAMIO_API_GATEWAY_URL,
            description: 'Andamio API Gateway (Dev)'
          }
        ];
        console.log(`  ✅ Set servers field: ${openapi.servers[0].url}`);

        resolve(openapi);
      }
    });
  });
}

async function generateApiDocs() {
  console.log('🚀 Starting API documentation generation...');
  
  for (const config of API_CONFIGS) {
    console.log(`\n📝 Processing: ${config.input}`);
    
    try {
      let inputPath = config.input;
      
      // Convert Swagger 2.0 to OpenAPI 3.0 if needed
      if (!config.isOpenAPI) {
        console.log('  Converting Swagger 2.0 to OpenAPI 3.0...');
        const openApiSpec = await convertSwaggerToOpenAPI(config.input);
        
        // Save converted spec to temp file
        const tempPath = config.input.replace(/\.(json|yaml|yml)$/, '-openapi.json');
        await fs.writeFile(tempPath, JSON.stringify(openApiSpec, null, 2));
        inputPath = tempPath;
        console.log(`  ✅ Converted and saved to: ${tempPath}`);
      }
      
      // Ensure output directory exists
      await fs.mkdir(config.output, { recursive: true });
      
      // Generate MDX documentation
      await generateFiles({
        input: [inputPath],
        output: config.output,
        includeDescription: true,
        groupByTags: true,
        useTagGroups: true,
        addBadges: true,
      });
      
      console.log(`  ✅ Generated docs in: ${config.output}`);
    } catch (error) {
      console.error(`  ❌ Error processing ${config.input}:`, error.message);
    }
  }
  
  console.log('\n✨ API documentation generation complete!');
}

generateApiDocs().catch(console.error);