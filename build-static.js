import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Build the Vite project
console.log('Building Vite project...');
execSync('vite build', { stdio: 'inherit' });

// Copy public folder to docs
console.log('Copying public assets to docs folder...');
const publicDir = './public';
const docsDir = './docs';

function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read all files and directories
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy directories
      copyDir(srcPath, destPath);
    } else {
      // Copy files
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  }
}

// Copy public folder to docs
if (fs.existsSync(publicDir)) {
  copyDir(publicDir, docsDir);
  console.log('Public assets copied successfully!');
} else {
  console.log('Public directory not found, skipping...');
}

console.log('Build completed!');