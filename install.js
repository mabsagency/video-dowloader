const { execSync } = require('child_process');

console.log('Installing dependencies...');

try {
  // Install npm dependencies
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });

  // Install additional test dependency
  execSync('npm install node-fetch', { stdio: 'inherit', cwd: __dirname });

  console.log('✅ Dependencies installed successfully!');
} catch (error) {
  console.error('❌ Error installing dependencies:', error.message);
  process.exit(1);
}