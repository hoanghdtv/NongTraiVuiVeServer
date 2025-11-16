// IGridService.ts
import { BuildingInstance, BuildingsState } from "./types";

/**
 * Interface for Grid Service
 * Manages building placement, removal, and upgrades on a 2D grid
 */
export interface IGridService {
  /**
   * Initialize the service with a buildings state
   * @param state - The initial buildings state
   */
  init(state: BuildingsState): void;

  /**
   * Get a snapshot of the current buildings state
   * @returns A deep copy of the current state
   */
  getSnapshot(): BuildingsState;

  /**
   * Check if a building can be placed at the given position
   * @param origin - The origin position {x, y}
   * @param w - Width of the building
   * @param h - Height of the building
   * @param bounds - Grid boundaries {width, height}
   * @returns true if the building can be placed, false otherwise
   */
  canPlace(
    origin: { x: number; y: number },
    w: number,
    h: number,
    bounds: { width: number; height: number }
  ): boolean;

  /**
   * Place a building on the grid
   * @param ownerId - ID of the owner
   * @param defId - ID of the building definition
   * @param origin - The origin position {x, y}
   * @param w - Width of the building
   * @param h - Height of the building
   * @param rotation - Optional rotation (0, 1, 2, 3)
   * @returns The placed building
   */
  place(
    ownerId: string,
    defId: string,
    origin: { x: number; y: number },
    w: number,
    h: number,
    rotation?: number
  ): BuildingInstance;

  /**
   * Check if a building can be removed by the owner
   * @param ownerId - ID of the owner
   * @param buildingId - ID of the building to remove
   * @returns true if the building can be removed, false otherwise
   */
  canRemove(ownerId: string, buildingId: string): boolean;

  /**
   * Remove a building from the grid
   * @param ownerId - ID of the owner
   * @param buildingId - ID of the building to remove
   * @throws Error if the building cannot be removed
   */
  remove(ownerId: string, buildingId: string): void;

  /**
   * Check if a building can be upgraded
   * @param ownerId - ID of the owner
   * @param buildingId - ID of the building to upgrade
   * @param maxLevel - Optional maximum level constraint
   * @returns true if the building can be upgraded, false otherwise
   */
  canUpgrade(ownerId: string, buildingId: string, maxLevel?: number): boolean;

  /**
   * Upgrade a building to the next level
   * @param ownerId - ID of the owner
   * @param buildingId - ID of the building to upgrade
   * @returns The upgraded building
   * @throws Error if the building cannot be upgraded
   */
  upgrade(ownerId: string, buildingId: string): BuildingInstance;

  /**
   * Get a building by its ID
   * @param buildingId - ID of the building
   * @returns The building if found, undefined otherwise
   */
  getBuilding(buildingId: string): BuildingInstance | undefined;
}
