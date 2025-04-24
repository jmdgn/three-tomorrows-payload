import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('Starting custom build process...');

// Create a special .env file just for building
const envContent = `
PAYLOAD_SECRET=temp-secret-for-build-only
DATABASE_URI=mongodb://localhost:27017/mock-db
MONGODB_URI=mongodb://localhost:27017/mock-db
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
NEXT_PUBLIC_IS_BUILD=true
`;

console.log('Creating temporary build environment...');
fs.writeFileSync('.env.build', envContent);

// Create mock directories that might be needed for the build
const createDirIfNotExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
};

// Ensure required directories exist
createDirIfNotExists('dist');
createDirIfNotExists('.next');

// Create empty mock files to avoid import errors
const createEmptyMockFile = (filePath, content = '// Mock file for build') => {
  const dir = path.dirname(filePath);
  createDirIfNotExists(dir);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content);
    console.log(`Created mock file: ${filePath}`);
  }
};

// Create mock payload types file
createEmptyMockFile('payload-types.ts', 'export {};');

try {
  // Copy the build env to .env temporarily
  fs.copyFileSync('.env.build', '.env');
  console.log('Environment prepared for build.');

  // Run the Next.js build with special flags
  console.log('Running Next.js build...');
  execSync('next build', {
    env: {
      ...process.env,
      NEXT_PUBLIC_IS_BUILD: 'true',
      NODE_ENV: 'production',
    },
    stdio: 'inherit',
  });

  console.log('Next.js build completed successfully.');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
} finally {
  // Clean up the temporary files
  if (fs.existsSync('.env.build')) {
    fs.unlinkSync('.env.build');
  }
  if (fs.existsSync('.env')) {
    fs.unlinkSync('.env');
  }
  console.log('Cleaned up temporary build files.');
}

console.log('Build process completed.');