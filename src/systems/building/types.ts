// src/systems/buildings/types.ts
import { PlayerContext } from "../../models/PlayerContext";
import { ActionResult } from "../../models/ActionResult";

export type BuildingTemplate = {
  templateId: string;
  width: number;
  height: number;
  maxLevel?: number;
  cost?: Record<string, number>; // e.g. { coins: 100, wood: 5 }
  buildTimeSec?: number;
};

export type PlacedBuilding = {
  id: string;
  ownerId: string;
  templateId: string;
  level: number;
  origin: { x: number; y: number };
  rotation?: 0 | 90 | 180 | 270;
  placedAt: number;
  meta?: Record<string, any>;
};

export type BuildingsState = {
  byId: Record<string, PlacedBuilding>;
  occupancy: Record<string, { buildingId: string }>; // key "x:y"
  nextIdCounter?: number;
};

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
