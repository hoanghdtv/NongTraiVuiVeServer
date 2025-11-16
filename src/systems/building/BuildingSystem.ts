// src/systems/buildings/BuildingsSystem.ts
import { ISystem } from "../../systems/ISystem"; // assume exists in project root
import { TemplateRegistry, createTemplateRegistry } from "./templateRegistry";
import { GridService } from "./impl/GridService";
import {

  PlaceBuildingAction,
  RemoveBuildingAction,
  UpgradeBuildingAction,
  BuildingDef,
  BuildingsState
} from "./types";
import { PlayerContext } from "../../models/PlayerContext";
import { ActionResult } from "../../models/ActionResult";

/**
 * Options:
 * - bounds: grid width/height (per farm)
 * - templateRegistry: server-side templates
 * - inventoryChecker: async function to validate/cost resources (optional)
 */
export type BuildingsSystemOptions = {
  bounds?: { width: number; height: number };
  templateRegistry?: TemplateRegistry;
  // inventoryChecker: (userId, cost) => Promise<{ ok: boolean, error?: string }>
  inventoryChecker?: (userId: string, cost?: Record<string, number>) => Promise<{ ok: boolean; error?: string }>;
  inventoryApplier?: (userId: string, cost?: Record<string, number>) => Promise<{ ok: boolean; error?: string }>;
};

export function createBuildingsSystem(opts?: BuildingsSystemOptions): ISystem {
  const bounds = opts?.bounds ?? { width: 30, height: 30 };
  const registry = opts?.templateRegistry ?? createTemplateRegistry();
  const grid = new GridService();

  const init = (stateSlice?: BuildingsState) => {
    if (stateSlice) {
      grid.init(stateSlice);
    } else {
      grid.init({ byId: {}, occupancy: {}, nextIdCounter: 1 });
    }
  };

  const validateAction = (action: any, ctx: PlayerContext, farmState: any): ActionResult => {
    if (!ctx?.userId) return { ok: false, error: "NO_USER" };
    if (!action || !action.type) return { ok: false, error: "INVALID_ACTION" };

    if (action.type === "place.building") {
      const payload = action.payload as PlaceBuildingAction;
      const tpl = registry.get(payload.templateId);
      if (!tpl) return { ok: false, error: "INVALID_TEMPLATE" };
      if (!grid.canPlace(payload.origin, tpl.size.w, tpl.size.h, bounds)) return { ok: false, error: "CANNOT_PLACE" };
      // check resources if checker supplied
      if (opts?.inventoryChecker) {
        return { ok: true }; // do expensive check in apply to allow async applier
      }
      return { ok: true };
    }

    if (action.type === "remove.building") {
      const payload = action.payload as RemoveBuildingAction;
      if (!payload.buildingId) return { ok: false, error: "INVALID_PAYLOAD" };
      if (!grid.canRemove(ctx.userId, payload.buildingId)) return { ok: false, error: "CANNOT_REMOVE" };
      return { ok: true };
    }

    // if (action.type === "upgrade_building") {
    //   const payload = action.payload as UpgradeBuildingAction;
    //   const b = grid.getBuilding(payload.buildingId);
    //   if (!b) return { ok: false, error: "NOT_FOUND" };
    //   const tpl = registry.get(b.defId);
    //   if (!tpl) return { ok: false, error: "INVALID_TEMPLATE_ON_BUILDING" };
    //   if (!grid.canUpgrade(ctx.userId, payload.buildingId, tpl.)) return { ok: false, error: "MAX_LEVEL" };
    //   // resource check maybe async in apply
    //   return { ok: true };
    // }

    return { ok: false, error: "UNKNOWN_ACTION_TYPE" };
  };

  const applyAction = async (action: any, ctx: PlayerContext, farmState: any): Promise<ActionResult> => {
    if (action.type === "place.building") {
      const payload = action.payload as PlaceBuildingAction;
      const tpl = registry.get(payload.templateId) as BuildingDef;
      if (!tpl) return { ok: false, error: "INVALID_TEMPLATE" };

      // resource check / deduct if applier exists
      if (opts?.inventoryChecker) {
        const check = await opts.inventoryChecker(ctx.userId, tpl.buildCost.gold ? { gold: tpl.buildCost.gold } : undefined);
        if (!check.ok) return { ok: false, error: check.error || "NOT_ENOUGH_RESOURCES" };
        // apply cost
        if (opts.inventoryApplier) {
          const applied = await opts.inventoryApplier(ctx.userId, tpl.buildCost.gold ? { gold: tpl.buildCost.gold } : undefined);
          if (!applied.ok) return { ok: false, error: applied.error || "COST_APPLY_FAILED" };
        }
      }

      const placed = grid.place(ctx.userId, tpl.id, payload.origin, tpl.size.w, tpl.size.h, payload.rotation);
      // return minimal delta
      return {
        ok: true,
        stateDelta: { buildings: { added: [placed] } },
        events: [{ type: "BUILDING_PLACED", data: placed }],
        meta: { serverTime: Date.now() },
      };
    }

    if (action.type === "remove.building") {
      const payload = action.payload as RemoveBuildingAction;
      if (!grid.canRemove(ctx.userId, payload.buildingId)) return { ok: false, error: "CANNOT_REMOVE" };
      // optionally refund? handle via inventoryApplier if needed
      const removedBuilding = grid.getBuilding(payload.buildingId);
      grid.remove(ctx.userId, payload.buildingId);
      return {
        ok: true,
        stateDelta: { buildings: { removed: [payload.buildingId] } },
        events: [{ type: "BUILDING_REMOVED", data: { buildingId: payload.buildingId, origin: removedBuilding?.pos } }],
        meta: { serverTime: Date.now() },
      };
    }

    if (action.type === "upgrade.building") {
      const payload = action.payload as UpgradeBuildingAction;
      const b = grid.getBuilding(payload.buildingId);
      if (!b) return { ok: false, error: "NOT_FOUND" };
      const tpl = registry.get(b.id);
      if (!tpl) return { ok: false, error: "INVALID_TEMPLATE_ON_BUILDING" };

      // resource check & apply
      const upgradeCost = tpl.buildCost ? Object.fromEntries(Object.entries(tpl.buildCost.gold).map(([k, v]) => [k, Math.floor(v * (b.level + 1) * 0.5)])) : undefined;
      if (opts?.inventoryChecker) {
        const check = await opts.inventoryChecker(ctx.userId, upgradeCost);
        if (!check.ok) return { ok: false, error: check.error || "NOT_ENOUGH_RESOURCES" };
        if (opts.inventoryApplier) {
          const applied = await opts.inventoryApplier(ctx.userId, upgradeCost);
          if (!applied.ok) return { ok: false, error: applied.error || "COST_APPLY_FAILED" };
        }
      }

      const upgraded = grid.upgrade(ctx.userId, payload.buildingId);
      return {
        ok: true,
        stateDelta: { buildings: { updated: [upgraded] } },
        events: [{ type: "BUILDING_UPGRADED", data: upgraded }],
        meta: { serverTime: Date.now() },
      };
    }

    return { ok: false, error: "UNHANDLED_ACTION_IN_APPLY" };
  };

  const getStateSlice = (): BuildingsState => {
    return grid.getSnapshot();
  };

  const onTick = (dt: number, farmState: any) => {
    // building system currently stateless on tick; placeholder for timers / construction progress
    return;
  };

  return {
    init,
    validateAction,
    applyAction,
    getStateSlice,
    onTick,
  } as ISystem;
}
