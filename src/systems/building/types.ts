import { BuildingInstance } from "../../shared/schemas/farm-states";

// Re-export types from shared schemas
export type PlaceBuildingAction = {
  templateId: string;
  origin: { x: number; y: number };
  rotation?: 0 | 90 | 180 | 270;
};

export type RemoveBuildingAction = {
  buildingId: string;
};

export type UpgradeBuildingAction = {
  buildingId: string;
};


export type CellOccupancy = {
  buildingId: string;
};


export type { 
  BuildingDef
} from "../../shared/configs/building-def";

export type {
  BuildingInstance,
} from "../../shared/schemas/farm-states";

export type BuildingsState = {
  byId: Record<string, BuildingInstance>;
  occupancy: Record<string, CellOccupancy>; // key format: "x:y"
  nextIdCounter: number;
};
