#!/usr/bin/env node

const { execSync } = require('child_process');

// Run Prisma db push to create tables
console.log('Setting up database...');
try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('Database setup completed successfully');
} catch (error) {
  console.error('Database setup failed:', error);
  // Continue anyway - tables might already exist
}

// Start the application
const args = process.argv.slice(2);
console.log('Starting application:', args.join(' '));
const { spawn } = require('child_process');
const child = spawn(args[0], args.slice(1), { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code);
});
