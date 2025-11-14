"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleConfig = void 0;
var building_def_1 = require("./building-def");
// import crypto from 'crypto';
var crop_def_1 = require("./crop-def");
// Example minimal config (for tests)
exports.exampleConfig = {
    config_version: '2025-11-14-0',
    checksum: '',
    building_defs: {
        barn: building_def_1.BuildingDef.fromJSON({
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
        silo: building_def_1.BuildingDef.fromJSON({
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
        yield: building_def_1.BuildingDef.fromJSON({
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
        chicken_house: building_def_1.BuildingDef.fromJSON({
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
        wheat: crop_def_1.CropDef.fromJSON({
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
