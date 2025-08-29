import converter from 'swagger2openapi';
import fs from 'fs/promises';
import path from 'path';

const convertSwaggerToOpenAPI = async () => {
  try {
    // Read the Swagger 2.0 file
    const swaggerPath = path.join(process.cwd(), 'data/example-swagger.json');
    const swaggerContent = await fs.readFile(swaggerPath, 'utf8');
    const swaggerDoc = JSON.parse(swaggerContent);

    // Convert to OpenAPI 3.0
    const options = {
      patch: true,
      warnOnly: true
    };

    converter.convertObj(swaggerDoc, options, async (err, result) => {
      if (err) {
        console.error('Conversion error:', err);
        process.exit(1);
      }

      // Save the converted OpenAPI 3.0 spec
      const outputPath = path.join(process.cwd(), 'data/example-openapi.yaml');
      const yamlContent = JSON.stringify(result.openapi, null, 2);
      
      await fs.writeFile(outputPath.replace('.yaml', '.json'), yamlContent);
      console.log(`✅ Converted Swagger 2.0 to OpenAPI 3.0: ${outputPath}`);
      
      // Generate MDX docs from the OpenAPI spec
      const { generateFiles } = await import('fumadocs-openapi');
      
      await generateFiles({
        input: ['./data/example-openapi.json'],
        output: './content/docs/apis/example',
        includeDescription: true,
        groupByTags: true,
        useTagGroups: true,
        addBadges: true,
      });
      
      console.log('✅ Generated MDX documentation files');
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

convertSwaggerToOpenAPI();