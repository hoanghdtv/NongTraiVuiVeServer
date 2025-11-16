// src/systems/buildings/GridService.ts
import { BuildingInstance, BuildingsState } from "../types";
import { IGridService } from "../IGridService";

function keyOf(x: number, y: number) { return `${x}:${y}`; }

export class GridService implements IGridService {
  private state: BuildingsState;

  constructor(initial?: BuildingsState) {
    this.state = initial || { byId: {}, occupancy: {}, nextIdCounter: 1 };
  }

  init(state: BuildingsState) {
    this.state = state;
  }

  getSnapshot(): BuildingsState {
    // deep copy light
    return {
      byId: JSON.parse(JSON.stringify(this.state.byId)),
      occupancy: { ...this.state.occupancy },
      nextIdCounter: this.state.nextIdCounter,
    };
  }

  private cellsFor(origin: { x: number; y: number }, w: number, h: number) {
    const cells: Array<{ x: number; y: number }> = [];
    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        cells.push({ x: origin.x + dx, y: origin.y + dy });
      }
    }
    return cells;
  }

  canPlace(origin: { x: number; y: number }, w: number, h: number, bounds: { width: number; height: number }) {
    // bounds check
    if (origin.x < 0 || origin.y < 0) return false;
    if (origin.x + w > bounds.width) return false;
    if (origin.y + h > bounds.height) return false;
    // occupancy check
    const cells = this.cellsFor(origin, w, h);
    for (const c of cells) {
      if (this.state.occupancy[keyOf(c.x, c.y)]) return false;
    }
    return true;
  }

  place(ownerId: string, defId: string, origin: { x: number; y: number }, w: number, h: number, rotation?: number) {
    const id = `b_${this.state.nextIdCounter++}_${Date.now().toString(36)}`;
    const now = Date.now();
    const placed: BuildingInstance = {
      id,
      defId,
      ownerId,
      pos: origin,
      rotation: (rotation as any) || 0,
      level: 1,
      createdAt: now,
      meta: { width: w, height: h },
    };
    // mark occupancy
    const cells = this.cellsFor(origin, w, h);
    for (const c of cells) {
      this.state.occupancy[keyOf(c.x, c.y)] = { buildingId: id };
    }
    this.state.byId[id] = placed;
    return placed;
  }

  canRemove(ownerId: string, buildingId: string) {
    const b = this.state.byId[buildingId];
    return !!b && b.ownerId === ownerId;
  }

  remove(ownerId: string, buildingId: string) {
    if (!this.canRemove(ownerId, buildingId)) throw new Error("cannot_remove");
    const b = this.state.byId[buildingId];
    const w = b.meta?.width ?? 1;
    const h = b.meta?.height ?? 1;
    const cells = this.cellsFor(b.pos, w, h);
    for (const c of cells) {
      delete this.state.occupancy[keyOf(c.x, c.y)];
    }
    delete this.state.byId[buildingId];
  }

  canUpgrade(ownerId: string, buildingId: string, maxLevel?: number) {
    const b = this.state.byId[buildingId];
    if (!b || b.ownerId !== ownerId) return false;
    if (maxLevel && b.level >= maxLevel) return false;
    return true;
  }

  upgrade(ownerId: string, buildingId: string) {
    if (!this.canUpgrade(ownerId, buildingId)) throw new Error("cannot_upgrade");
    const b = this.state.byId[buildingId];
    b.level = (b.level || 1) + 1;
    return b;
  }

  getBuilding(buildingId: string) {
    return this.state.byId[buildingId];
  }
}
