// Player farm state schema
export interface ModuleState<T = any> {
  version: string; // semantic version per module
  data: T;
}

export interface FarmState {
  farm_id: string;
  owner_user_id?: string;
  schema_version: string; // global snapshot schema
  sequence: number; // monotonic sequence for optimistic locking
  last_updated?: string; // ISO timestamp
  modules: Record<string, ModuleState>;
}

// Example: types for crop module data
export interface CropPlot { id: string; seed_type: string; planted_at?: string; growth_stage?: number }
export interface CropModuleData { plots: CropPlot[]; seed_inventory: Record<string, number> }

// Example FarmState factory for tests
export const exampleFarm: FarmState = {
  farm_id: 'farm:001',
  schema_version: '1.0.0',
  sequence: 0,
  last_updated: new Date().toISOString(),
  modules: {
    crop: { version: '1.0.0', data: { plots: [], seed_inventory: {} } }
  }
};