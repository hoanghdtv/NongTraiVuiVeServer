// Auto-generated shared types for Nakama
// DO NOT EDIT - Run 'npm run sync-shared' to update

// Shared Game Config types and example data
type ID = string;

interface BuildingDef {
  id: ID;
  base_hp: number;
  upgrade_cost: Array<Record<string, number>>;
  max_level: number;
  // any other design-only fields
}

interface CropDef {
  id: ID;
  growth_seconds: number;
  stages: number[]; // 0..1 progress thresholds
  yield: Record<string, number>;
}

interface GameConfig {
  config_version: string; // e.g. git commit hash or semantic tag
  checksum: string; // sha256 of payload
  building_defs: Record<ID, BuildingDef>;
  crop_defs: Record<ID, CropDef>;
  // other defs: item_defs, animal_defs, economy, flags...
}

// Player farm state schema
interface ModuleState<T = any> {
  version: string; // semantic version per module
  data: T;
}

interface FarmState {
  farm_id: string;
  owner_user_id?: string;
  schema_version: string; // global snapshot schema
  sequence: number; // monotonic sequence for optimistic locking
  last_updated?: string; // ISO timestamp
  modules: Record<string, ModuleState>;
}

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
