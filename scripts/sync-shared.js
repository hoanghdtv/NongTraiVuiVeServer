#!/usr/bin/env node

/**
 * Script to sync shared types to Nakama
 * Usage: node scripts/sync-shared.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const sharedDir = path.join(__dirname, '../shared');
const nakamaTypesFile = path.join(__dirname, '../nakama/src/shared-types.ts');

console.log('🔄 Syncing shared types to Nakama...');

try {
  // Read shared files
  const gameConfigsPath = path.join(sharedDir, 'configs/game-configs.ts');
  const farmStatesPath = path.join(sharedDir, 'schemas/farm-states.ts');
  
  let gameConfigsContent = '';
  let farmStatesContent = '';
  
  if (fs.existsSync(gameConfigsPath)) {
    gameConfigsContent = fs.readFileSync(gameConfigsPath, 'utf8');
  }
  
  if (fs.existsSync(farmStatesPath)) {
    farmStatesContent = fs.readFileSync(farmStatesPath, 'utf8');
  }
  
  // Extract type definitions (remove imports and exports)
  const extractTypes = (content) => {
    return content
      .replace(/import.*from.*['"];/g, '')  // Remove imports
      .replace(/export\s+/g, '')            // Remove export keywords
      .replace(/\/\/ Example.*[\s\S]*$/m, '') // Remove example data
      .trim();
  };
  
  const gameConfigTypes = extractTypes(gameConfigsContent);
  const farmStateTypes = extractTypes(farmStatesContent);
  
  // Generate Nakama-compatible types file
  const nakamaTypesContent = `// Auto-generated shared types for Nakama
// DO NOT EDIT - Run 'npm run sync-shared' to update

${gameConfigTypes}

${farmStateTypes}

// Helper functions for Nakama
function computeConfigChecksum(cfg: Omit<GameConfig,'checksum'>): string {
  const canonical = JSON.stringify(cfg);
  // Simple hash for Nakama (since we don't have crypto module)
  let hash = 0;
  for (let i = 0; i < canonical.length; i++) {
    const char = canonical.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

function buildConfigWithChecksum(cfg: Omit<GameConfig,'checksum'>): GameConfig {
  return { ...cfg, checksum: computeConfigChecksum(cfg) };
}

// Example config for Nakama
const exampleConfig: Omit<GameConfig, 'checksum'> = {
  config_version: '2025-11-14-0',
  building_defs: {
    barn: { id: 'barn', base_hp: 100, upgrade_cost: [{ gold: 100 }], max_level: 5 }
  },
  crop_defs: {
    wheat: { id: 'wheat', growth_seconds: 3600, stages: [0.25,0.5,0.8,1], yield: { wheat: 3 } }
  }
};
`;
  
  // Write to Nakama
  const nakamaDir = path.dirname(nakamaTypesFile);
  if (!fs.existsSync(nakamaDir)) {
    fs.mkdirSync(nakamaDir, { recursive: true });
  }
  
  fs.writeFileSync(nakamaTypesFile, nakamaTypesContent);
  
  console.log('✅ Shared types synced to:', nakamaTypesFile);
  console.log('📝 Now you can import in main.ts with: /// <reference path="./shared-types.ts" />');
  
} catch (error) {
  console.error('❌ Error syncing shared types:', error.message);
  process.exit(1);
}