import { BuildingDef } from './building-def';

// import crypto from "node:crypto";
import { CropDef } from './crop-def';

// Shared Game Config types and example data
export type ID = string;

export interface GameConfig {
  config_version: string; // e.g. git commit hash or semantic tag
  checksum: string; // sha256 of payload
  building_defs: Record<ID, BuildingDef>;
  crop_defs: Record<ID, CropDef>;
  // other defs: item_defs, animal_defs, economy, flags...
}

// Example minimal config (for tests)
export const exampleConfig: GameConfig = {
  config_version: '2025-11-14-0',
  checksum: '',
  building_defs: {
    barn: BuildingDef.fromJSON({ 
      id: 'barn', 
      name: 'Barn',
      category: 'storage',
      size: { w: 3, h: 3 },
      buildCost: { gold: 50, materials: { wood: 30 } },
      buildTimeSeconds: 120,
      maxCapacity: { hay: 100 },
      upgrades: [
        { level: 2, cost: { gold: 100 }, capacityMultiplier: 1.5 },
        { level: 3, cost: { gold: 200 }, capacityMultiplier: 2.0 }
      ]
    }),
    silo: BuildingDef.fromJSON({
      id: 'silo',
      name: 'Silo',
      category: 'storage',
      size: { w: 2, h: 2 },
      buildCost: { gold: 40, materials: { wood: 20 } },
      buildTimeSeconds: 90,
      maxCapacity: { grain: 200 },
      upgrades: [
        { level: 2, cost: { gold: 80 }, capacityMultiplier: 1.5 },
        { level: 3, cost: { gold: 160 }, capacityMultiplier: 2.0 }
      ]
    }),
    yield: BuildingDef.fromJSON({
      id: 'yield',
      name: 'Yield Storage',
      category: 'storage',
      size: { w: 2, h: 2 },
      buildCost: { gold: 30, materials: { wood: 15 } },
      buildTimeSeconds: 60,
      maxCapacity: { crops: 150 },
      upgrades: [
        { level: 2, cost: { gold: 60 }, capacityMultiplier: 1.5 }
      ]
    }),
    chicken_house: BuildingDef.fromJSON({
      id: 'chicken_house',
      name: 'Chicken House',
      category: 'animal',
      size: { w: 2, h: 3 },
      buildCost: { gold: 45, materials: { wood: 25 } },
      buildTimeSeconds: 100,
      maxCapacity: { chickens: 10 },
      production: { type: 'animal', output: { eggs: 1 }, cycleSeconds: 3600 },
      upgrades: [
        { level: 2, cost: { gold: 90 }, capacityMultiplier: 1.5 },
        { level: 3, cost: { gold: 180 }, capacityMultiplier: 2.0 }
      ]
    })
  },
  crop_defs: {
    wheat: CropDef.fromJSON({ 
      id: 'wheat',
      name: 'Wheat', 
      baseGrowthSeconds: 3600,
      growthStages: 4,
      growthTimesSeconds: [900, 900, 900, 900],
      yield: { min: 2, max: 4 },
      sellPrice: 5,
      seedCost: 2
    })
  }
};


// checksum util (node crypto)
// export function computeConfigChecksum(cfg: Omit<GameConfig,'checksum'>) {
//   const canonical = JSON.stringify(cfg);
//   return crypto.createHash('sha256').update(canonical).digest('hex');
// }

// export function buildConfigWithChecksum(cfg: Omit<GameConfig,'checksum'>): GameConfig {
//   return { ...cfg, checksum: computeConfigChecksum(cfg) };
// }