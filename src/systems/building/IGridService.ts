// IGridService.ts
// import { GridCoord, PlacedBuilding, GridSnapshot, BuildingTemplate, UserId } from "./types";

// export interface IGridService {
//   init(snapshot?: GridSnapshot): void;
//   canPlaceBuilding(userId: UserId, origin: GridCoord, template: BuildingTemplate, rotation?: number): boolean;
//   placeBuilding(userId: UserId, origin: GridCoord, template: BuildingTemplate, rotation?: number): PlacedBuilding; 
//   canRemoveBuilding(userId: UserId, buildingId: string): boolean;
//   removeBuilding(userId: UserId, buildingId: string): void;
//   canUpgradeBuilding(userId: UserId, buildingId: string): boolean;
//   upgradeBuilding(userId: UserId, buildingId: string): PlacedBuilding;
//   getSnapshot(): GridSnapshot;
//   getBuilding(buildingId: string): PlacedBuilding | undefined;
// }
