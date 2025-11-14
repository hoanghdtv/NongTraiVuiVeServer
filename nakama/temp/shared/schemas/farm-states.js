"use strict";
// primitives
Object.defineProperty(exports, "__esModule", { value: true });
exports.exampleFarmState = void 0;
// Example minimal farm state (for tests)
exports.exampleFarmState = {
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
