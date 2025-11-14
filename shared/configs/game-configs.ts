// Shared Game Config types and example data
export type ID = string;

export interface BuildingDef {
  id: ID;
  base_hp: number;
  upgrade_cost: Array<Record<string, number>>;
  max_level: number;
  // any other design-only fields
}

export interface CropDef {
  id: ID;
  growth_seconds: number;
  stages: number[]; // 0..1 progress thresholds
  yield: Record<string, number>;
}

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
    barn: { id: 'barn', base_hp: 100, upgrade_cost: [{ gold: 100 }], max_level: 5 }
  },
  crop_defs: {
    wheat: { id: 'wheat', growth_seconds: 3600, stages: [0.25,0.5,0.8,1], yield: { wheat: 3 } }
  }
};

// checksum util (node crypto)
import crypto from 'crypto';
export function computeConfigChecksum(cfg: Omit<GameConfig,'checksum'>) {
  const canonical = JSON.stringify(cfg);
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

export function buildConfigWithChecksum(cfg: Omit<GameConfig,'checksum'>): GameConfig {
  return { ...cfg, checksum: computeConfigChecksum(cfg) };
}