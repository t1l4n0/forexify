#!/usr/bin/env node

const { execSync } = require('child_process');

// Run Prisma migrations
console.log('Running database migrations...');
try {
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Migrations completed successfully');
} catch (error) {
  console.error('Migration failed, trying db push...');
  try {
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database push completed');
  } catch (pushError) {
    console.error('Database setup failed:', pushError);
    process.exit(1);
  }
}

// Start the application
const args = process.argv.slice(2);
console.log('Starting application:', args.join(' '));
const { spawn } = require('child_process');
const child = spawn(args[0], args.slice(1), { stdio: 'inherit' });

child.on('exit', (code) => {
  process.exit(code);
});
