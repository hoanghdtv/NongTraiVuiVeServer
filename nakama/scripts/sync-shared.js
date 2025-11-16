#!/usr/bin/env node

/**
 * Script to build shared types for Nakama compatibility
 * Usage: node scripts/sync-shared.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const sharedDir = path.join(__dirname, '../../src/shared');
const nakamaSharedDir = path.join(__dirname, '../src/shared');

console.log('🔄 Building shared types for Nakama...');

try {
  // Create nakama/src/shared directory if it doesn't exist
  if (!fs.existsSync(nakamaSharedDir)) {
    fs.mkdirSync(nakamaSharedDir, { recursive: true });
    console.log('📁 Created:', nakamaSharedDir);
  }
  
  // Function to recursively copy directory
  function copyDirectory(src, dest) {
    // Create destination directory
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    // Read source directory
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      
      if (entry.isDirectory()) {
        // Recursively copy subdirectory
        copyDirectory(srcPath, destPath);
      } else if (entry.isFile() && entry.name.endsWith('.ts')) {
        // Copy TypeScript files
        const content = fs.readFileSync(srcPath, 'utf8');
        
        // Transform imports for Nakama compatibility
        const transformedContent = content
          .replace(/from ['"]crypto['"]/g, 'from "node:crypto"')
          .replace(/export \{[^}]*\} from ['"]\.\/index['"]/g, ''); // Remove re-exports
        
        fs.writeFileSync(destPath, transformedContent);
        console.log('  ✓ Copied:', entry.name);
      }
    }
  }
  
  // Copy shared directory structure
  copyDirectory(sharedDir, nakamaSharedDir);
  
  // Create index.ts in nakama/src/shared if it doesn't exist
  const nakamaIndexPath = path.join(nakamaSharedDir, 'index.ts');
  if (!fs.existsSync(nakamaIndexPath)) {
    const indexContent = `// Re-export all shared types for Nakama
export * from './configs/game-configs';
export * from './schemas/farm-states';
export * from './configs/building-def';
export * from './configs/crop-def';
export * from './configs/types';
`;
    fs.writeFileSync(nakamaIndexPath, indexContent);
    console.log('  ✓ Created: index.ts');
  }
  
  console.log('✅ Shared directory synced to Nakama');
  console.log('📂 Location:', nakamaSharedDir);
  console.log('� Import in Nakama: import { GameConfig } from "./shared"');
  
} catch (error) {
  console.error('❌ Error syncing shared directory:', error.message);
  console.error(error.stack);
  process.exit(1);
}
