// primitives

import { ID } from "../configs/game-configs";

// type ID = string;                  // stable slug or uuid
export type Timestamp = number;           // epoch ms
export type Pos = { x: number; y: number }; // tile-based or world coords

// FarmState root
export interface FarmState {
  version: number;                        // tăng khi schema thay đổi
  tick: number;                           // server tick counter
  timeLastSaved?: Timestamp;
  players: Record<ID, PlayerState>;
  buildings: Record<ID, BuildingInstance>;
  crops: Record<ID, CropInstance>;
  animals: Record<ID, AnimalInstance>;
  inventories: Record<ID, Inventory>;     // per-player or global storages keyed by storageId
  world: WorldMeta;
  // optional runtime-only caches (do not persist) can be stored elsewhere
}

// Player
export interface PlayerState {
  id: ID;
  name?: string;
  gold: number;
  location?: Pos;
  ownedBuildingIds: ID[];   // reference list (redundant but convenient)
  ownedCropIds: ID[];
  ownedAnimalIds: ID[];
  inventoryId?: ID;         // reference into inventories
  lastActiveAt?: Timestamp;
}

// Building instance (maps to BuildingDef.id via defId)
export interface BuildingInstance {
  id: ID;                   // unique instance id (uuid)
  defId: ID;                // BuildingDef.id (stable)
  ownerId?: ID;             // player who owns it (optional)
  pos: Pos;                 // placement position (tile coordinates)
  rotation?: number;
  level: number;            // upgrade level
  hp?: number;              // optional health
  createdAt: Timestamp;
  upgradedUntil?: Timestamp; // if upgrading, timestamp when upgrade completes
  state?: Record<string, any>; // dynamic runtime state (e.g., queue, currentProduction)
  meta?: Record<string, any>;  // non-gameplay metadata (design-time)
}

// Crop instance (maps to CropDef.id via defId)
export interface CropInstance {
  id: ID;
  defId: ID;                // CropDef.id
  ownerId?: ID;
  tile: Pos;                // tile coordinates where planted
  plantedAt: Timestamp;
  growthStage: number;      // 0..(growthStages-1)
  nextStageAt?: Timestamp;  // epoch ms when it will advance (server-calculated)
  wateredStages: number[];  // array of stage indexes that received water (or counters)
  fertilized?: boolean;
  disease?: { chance: number; flaggedAt: Timestamp } | null;
  harvestReadyAt?: Timestamp;
  lastUpdatedAt: Timestamp;
  extra?: Record<string, any>;
}

// Animal instance (simple)
export interface AnimalInstance {
  id: ID;
  defId: ID;                // animal def id
  ownerId?: ID;
  pos: Pos;
  ageSeconds: number;
  hunger: number;           // normalized value
  health: number;
  producedUntil?: Timestamp; // next produce ready
  breedingCooldownUntil?: Timestamp | null;
  createdAt: Timestamp;
  extra?: Record<string, any>;
}

// Inventory
export interface Inventory {
  id: ID;
  ownerId?: ID;             // player or buildingId (e.g., barn)
  capacity?: number;
  items: Record<string, number>; // itemId -> count
  lastModifiedAt: Timestamp;
}

// World meta
export interface WorldMeta {
  season?: string;
  dayIndex?: number;
  timeOfDay?: number; // seconds from midnight or 0..1 float
  tickIntervalSeconds?: number;
}

// Example minimal farm state (for tests)
export const exampleFarmState: FarmState = {
  version: 1,
  tick: 0,
  players: {
    player1: {
      id: 'player1',
      name: 'Alice',
      gold: 100,
      ownedBuildingIds: ['building_barn_1', 'building_silo_1'], 
      ownedCropIds: [],
      ownedAnimalIds: [],
      inventoryId: 'inventory_player1'
    }
  },
  buildings: {
    building_barn_1: {
      id: 'building_barn_1',
      defId: 'barn',
      ownerId: 'player1',
      pos: { x: 5, y: 5 },
      rotation: 0,
      level: 1,
      hp: 150,
      createdAt: Date.now(),
      state: { currentStorage: { hay: 0 } }
    },
    building_silo_1: {
      id: 'building_silo_1',
      defId: 'silo',
      ownerId: 'player1',
      pos: { x: 10, y: 5 },
      rotation: 0,
      level: 1,
      hp: 100,
      createdAt: Date.now(),
      state: { currentStorage: { grain: 0 } }
    }
  },
  crops: {},
  animals: {},
  inventories: {
    inventory_player1: {
      id: 'inventory_player1',
      ownerId: 'player1',
      capacity: 50,
      items: { wood: 20, gold: 100 },
      lastModifiedAt: Date.now()
    }
  },
  world: {
    season: 'spring',
    dayIndex: 1,
    timeOfDay: 0,
    tickIntervalSeconds: 1
  }
};