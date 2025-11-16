import { Schema, type, MapSchema } from "@colyseus/schema";
import { AnimalInstance, BuildingInstance, CropInstance, FarmState, Inventory, PlayerState, WorldMeta } from "../shared";

export class FarmGameState extends Schema implements FarmState {
    @type("number")version: number;
    @type("number")tick: number;
    @type("number") timeLastSaved?: number;
    players: Record<string, PlayerState>;
    buildings: Record<string, BuildingInstance>;
    crops: Record<string, CropInstance>;
    animals: Record<string, AnimalInstance>;
    inventories: Record<string, Inventory>;
    world: WorldMeta;
}

export class GameState extends Schema {
    @type(FarmGameState) farmState = new FarmGameState();
    @type("string") gameStatus: string = "waiting";
    @type("number") playerCount: number = 0;
    @type({ map: "string" }) players = new MapSchema<string>();
  version: any;
}