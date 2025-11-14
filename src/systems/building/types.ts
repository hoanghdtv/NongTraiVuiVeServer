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

export type { 
  BuildingDef,
  PlacedBuilding, 
  BuildingsState,
} from '../../../shared/schemas/building-types';
