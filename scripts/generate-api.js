#!/usr/bin/env node
/**
 * API Type Generator Script
 *
 * This script fetches the Swagger/OpenAPI specification from the backend
 * and generates TypeScript types using NSwag.
 *
 * Usage:
 *   npm run generate-api:all    - Generate both V1 and V2 types
 *   npm run generate-api:v1     - Generate V1 types only
 *   npm run generate-api:v2     - Generate V2 types only
 *
 * Prerequisites:
 *   - Backend must be running at http://localhost:5000
 *   - .NET 8 runtime must be installed (for NSwag)
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5241';

async function checkBackendAvailable() {
  try {
    const response = await fetch(`${BASE_URL}/swagger/v1/swagger.json`);
    return response.ok;
  } catch {
    return false;
  }
}

async function downloadSwaggerSpec(version) {
  const url = `${BASE_URL}/swagger/${version}/swagger.json`;
  console.log(`Fetching ${url}...`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch swagger spec: ${response.status} ${response.statusText}`);
  }

  const spec = await response.json();
  const specDir = join(projectRoot, 'swagger-specs');

  if (!existsSync(specDir)) {
    mkdirSync(specDir, { recursive: true });
  }

  const specPath = join(specDir, `swagger-${version}.json`);
  writeFileSync(specPath, JSON.stringify(spec, null, 2));
  console.log(`Saved swagger spec to ${specPath}`);

  return specPath;
}

async function generateTypes(version) {
  console.log(`\nGenerating API types for ${version}...`);

  try {
    // Download the spec first
    await downloadSwaggerSpec(version);

    // Run NSwag
    const configFile = `nswag.${version}.json`;
    console.log(`Running NSwag with ${configFile}...`);

    execSync(`npx nswag run ${configFile}`, {
      cwd: projectRoot,
      stdio: 'inherit'
    });

    console.log(`Successfully generated types for ${version}`);
  } catch (error) {
    console.error(`Failed to generate types for ${version}:`, error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const versions = args.length > 0 ? args : ['v1', 'v2'];

  console.log('API Type Generator');
  console.log('==================');
  console.log(`Backend URL: ${BASE_URL}`);
  console.log(`Versions: ${versions.join(', ')}`);

  // Check if backend is available
  const isAvailable = await checkBackendAvailable();
  if (!isAvailable) {
    console.error('\nError: Backend is not available at ' + BASE_URL);
    console.error('Please start the backend first:');
    console.error('  cd backend && dotnet run --project src/WebAPI');
    process.exit(1);
  }

  console.log('Backend is available!');

  for (const version of versions) {
    await generateTypes(version);
  }

  console.log('\nAll types generated successfully!');
}

main().catch(error => {
  console.error('Generation failed:', error);
  process.exit(1);
});
