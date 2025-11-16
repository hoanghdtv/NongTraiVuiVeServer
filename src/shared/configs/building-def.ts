// building-def.ts
import { Size, Cost, Upgrade, Placement, Production } from "./types";

export interface RawBuildingDef {
  id: string;
  name?: string;
  category?: string;
  size?: Size;
  maxCapacity?: Record<string, number>;
  buildCost?: Cost;
  buildTimeSeconds?: number;
  upgrades?: Upgrade[];
  placement?: Placement;
  production?: Production;
  tags?: string[];
  // allow extra extension fields
  [k: string]: any;
}

export class BuildingDef {
  public readonly id: string;
  public readonly name: string;
  public readonly category: string;
  public readonly size: Size;
  public readonly maxCapacity: Readonly<Record<string, number>>;
  public readonly buildCost: Readonly<Cost>;
  public readonly buildTimeSeconds: number;
  public readonly upgrades: ReadonlyArray<Upgrade>;
  public readonly placement: Readonly<Placement>;
  public readonly production?: Readonly<Production>;
  public readonly tags: ReadonlyArray<string>;
  public readonly raw: Readonly<RawBuildingDef>;

  private constructor(raw: RawBuildingDef) {
    this.id = raw.id;
    this.name = raw.name ?? raw.id;
    this.category = raw.category ?? "generic";
    this.size = { w: raw.size?.w ?? 1, h: raw.size?.h ?? 1 };
    this.maxCapacity = Object.freeze({ ...(raw.maxCapacity ?? {}) });
    this.buildCost = Object.freeze({ ...(raw.buildCost ?? {}) });
    this.buildTimeSeconds = raw.buildTimeSeconds ?? 0;
    this.upgrades = Object.freeze((raw.upgrades ?? []).map(u => ({ ...u })));
    this.placement = Object.freeze({
      canOverlap: raw.placement?.canOverlap ?? false,
      requiresFoundation: raw.placement?.requiresFoundation ?? false
    });
    this.production = raw.production ? Object.freeze({ ...raw.production }) : undefined;
    this.tags = Object.freeze(raw.tags ?? []);
    this.raw = Object.freeze({ ...raw });
    Object.freeze(this);
  }

  /** Lightweight validation — returns array of error messages (empty if ok) */
  public static validateRaw(raw: RawBuildingDef): string[] {
    const err: string[] = [];
    if (!raw || typeof raw !== "object") { err.push("definition must be object"); return err; }
    if (!raw.id || typeof raw.id !== "string") err.push("id is required and must be string");
    if (raw.size) {
      if (typeof raw.size.w !== "number" || typeof raw.size.h !== "number")
        err.push("size.w and size.h must be numbers");
    }
    if (raw.buildTimeSeconds !== undefined && typeof raw.buildTimeSeconds !== "number")
      err.push("buildTimeSeconds must be number");
    if (raw.upgrades && !Array.isArray(raw.upgrades)) err.push("upgrades must be array");
    // add more rules as needed
    return err;
  }

  /** Factory: validate then create immutable BuildingDef */
  public static fromJSON(raw: RawBuildingDef): BuildingDef {
    const errs = BuildingDef.validateRaw(raw);
    if (errs.length) throw new Error(`Invalid BuildingDef ${raw?.id ?? ""}: ${errs.join("; ")}`);
    return new BuildingDef(raw);
  }

  public toJSON(): RawBuildingDef {
    return { ...this.raw };
  }
}
