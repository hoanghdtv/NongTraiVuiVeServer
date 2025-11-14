export * from './configs/game-configs';
export * from './schemas/farm-states';

import { v4 as uuidv4 } from "uuid";
import { BuildingInstance, CropInstance, Pos } from './schemas/farm-states';
import { BuildingDef } from './configs/building-def';
import { CropDef } from './configs/crop-def';

export function createBuildingInstance(defId: string, ownerId: string|undefined, pos: Pos, defMap: Map<string, BuildingDef>): BuildingInstance {
  const def = defMap.get(defId);
  if (!def) throw new Error(`Unknown building def ${defId}`);
  const now = Date.now();
  return {
    id: uuidv4(),
    defId,
    ownerId,
    pos,
    rotation: 0,
    level: 1,
    hp: undefined,
    createdAt: now,
    upgradedUntil: undefined,
    state: {},
    meta: {}
  };
}

export function createCropInstance(defId: string, ownerId: string|undefined, tile: Pos, cropDefs: Map<string, CropDef>): CropInstance {
  const def = cropDefs.get(defId);
  if (!def) throw new Error(`Unknown crop def ${defId}`);
  const now = Date.now();
  const stage = 0;
  const nextStageAt = now + def.growthTimesSeconds[0] * 1000;
  return {
    id: uuidv4(),
    defId,
    ownerId,
    tile,
    plantedAt: now,
    growthStage: stage,
    nextStageAt,
    wateredStages: [],
    fertilized: false,
    disease: null,
    harvestReadyAt: undefined,
    lastUpdatedAt: now,
    extra: {}
  };
}

