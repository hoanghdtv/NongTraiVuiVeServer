"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBuildingInstance = createBuildingInstance;
exports.createCropInstance = createCropInstance;
__exportStar(require("./configs/game-configs"), exports);
__exportStar(require("./schemas/farm-states"), exports);
var uuid_1 = require("uuid");
function createBuildingInstance(defId, ownerId, pos, defMap) {
    var def = defMap.get(defId);
    if (!def)
        throw new Error("Unknown building def ".concat(defId));
    var now = Date.now();
    return {
        id: (0, uuid_1.v4)(),
        defId: defId,
        ownerId: ownerId,
        pos: pos,
        rotation: 0,
        level: 1,
        hp: undefined,
        createdAt: now,
        upgradedUntil: undefined,
        state: {},
        meta: {}
    };
}
function createCropInstance(defId, ownerId, tile, cropDefs) {
    var def = cropDefs.get(defId);
    if (!def)
        throw new Error("Unknown crop def ".concat(defId));
    var now = Date.now();
    var stage = 0;
    var nextStageAt = now + def.growthTimesSeconds[0] * 1000;
    return {
        id: (0, uuid_1.v4)(),
        defId: defId,
        ownerId: ownerId,
        tile: tile,
        plantedAt: now,
        growthStage: stage,
        nextStageAt: nextStageAt,
        wateredStages: [],
        fertilized: false,
        disease: null,
        harvestReadyAt: undefined,
        lastUpdatedAt: now,
        extra: {}
    };
}
