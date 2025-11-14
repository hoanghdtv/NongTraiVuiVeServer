import { Season, SpecialEffects } from "./types";

// crop-def.ts
export interface RawCropDef {
  id: string;
  name?: string;
  seasons?: Season[];                 // allowed seasons
  growthStages?: number;              // integer >=1
  growthTimesSeconds?: number[];      // array length = growthStages
  waterRequiredPerStage?: number[];   // array length = growthStages
  baseGrowthSeconds?: number;         // fallback if growthTimesSeconds missing
  yield?: { min: number; max: number } | number;
  sellPrice?: number;
  seedCost?: number;
  diseaseChancePerStage?: number[];   // array length = growthStages
  harvestRequiresTool?: boolean;
  special?: SpecialEffects;
  tags?: string[];
  [k: string]: any;
}

export class CropDef {
  public readonly id: string;
  public readonly name: string;
  public readonly seasons: ReadonlyArray<Season>;
  public readonly growthStages: number;
  public readonly growthTimesSeconds: ReadonlyArray<number>;
  public readonly waterRequiredPerStage: ReadonlyArray<number>;
  public readonly baseGrowthSeconds?: number;
  public readonly yield: Readonly<{ min: number; max: number }>;
  public readonly sellPrice: number;
  public readonly seedCost: number;
  public readonly diseaseChancePerStage: ReadonlyArray<number>;
  public readonly harvestRequiresTool: boolean;
  public readonly special?: Readonly<SpecialEffects>;
  public readonly tags: ReadonlyArray<string>;
  public readonly raw: Readonly<RawCropDef>;

  private constructor(raw: RawCropDef) {
    this.id = raw.id;
    this.name = raw.name ?? raw.id;
    this.seasons = Object.freeze(raw.seasons ?? []);
    this.growthStages = Math.max(1, Math.floor(raw.growthStages ?? (raw.growthTimesSeconds?.length ?? 1)));
    // normalize growthTimesSeconds: if provided use it, else split baseGrowthSeconds evenly
    if (Array.isArray(raw.growthTimesSeconds) && raw.growthTimesSeconds.length === this.growthStages) {
      this.growthTimesSeconds = Object.freeze(raw.growthTimesSeconds.map(n => Math.max(1, Math.floor(n))));
    } else if (typeof raw.baseGrowthSeconds === "number") {
      const per = Math.max(1, Math.floor(raw.baseGrowthSeconds / this.growthStages));
      this.growthTimesSeconds = Object.freeze(new Array(this.growthStages).fill(per));
    } else {
      this.growthTimesSeconds = Object.freeze(new Array(this.growthStages).fill(60)); // fallback 60s per stage
    }

    // waterRequiredPerStage
    if (Array.isArray(raw.waterRequiredPerStage) && raw.waterRequiredPerStage.length === this.growthStages) {
      this.waterRequiredPerStage = Object.freeze(raw.waterRequiredPerStage.map(n => Math.max(0, Number(n))));
    } else {
      this.waterRequiredPerStage = Object.freeze(new Array(this.growthStages).fill(1));
    }

    this.baseGrowthSeconds = raw.baseGrowthSeconds;
    // yield: allow single number or min/max
    if (typeof raw.yield === "number") {
      this.yield = Object.freeze({ min: raw.yield, max: raw.yield });
    } else {
      const y = raw.yield ?? { min: 1, max: 1 };
      this.yield = Object.freeze({ min: Math.max(0, Math.floor(y.min ?? 1)), max: Math.max(0, Math.floor(y.max ?? y.min ?? 1)) });
    }

    this.sellPrice = Number(raw.sellPrice ?? 0);
    this.seedCost = Number(raw.seedCost ?? 0);
    if (Array.isArray(raw.diseaseChancePerStage) && raw.diseaseChancePerStage.length === this.growthStages) {
      this.diseaseChancePerStage = Object.freeze(raw.diseaseChancePerStage.map(n => Math.max(0, Number(n))));
    } else {
      this.diseaseChancePerStage = Object.freeze(new Array(this.growthStages).fill(0));
    }
    this.harvestRequiresTool = Boolean(raw.harvestRequiresTool ?? false);
    this.special = raw.special ? Object.freeze({ ...raw.special }) : undefined;
    this.tags = Object.freeze(raw.tags ?? []);
    this.raw = Object.freeze({ ...raw });
    Object.freeze(this);
  }

  public static validateRaw(raw: RawCropDef): string[] {
    const err: string[] = [];
    if (!raw || typeof raw !== "object") { err.push("crop definition must be object"); return err; }
    if (!raw.id || typeof raw.id !== "string") err.push("id is required and must be string");
    if (raw.growthStages !== undefined && (!Number.isInteger(raw.growthStages) || raw.growthStages < 1))
      err.push("growthStages must be integer >= 1");
    if (raw.growthTimesSeconds && !Array.isArray(raw.growthTimesSeconds))
      err.push("growthTimesSeconds must be array");
    if (raw.waterRequiredPerStage && !Array.isArray(raw.waterRequiredPerStage))
      err.push("waterRequiredPerStage must be array");
    if (raw.diseaseChancePerStage && !Array.isArray(raw.diseaseChancePerStage))
      err.push("diseaseChancePerStage must be array");
    // lengths check if arrays given with growthStages
    const stages = raw.growthStages ?? raw.growthTimesSeconds?.length;
    if (stages && raw.growthTimesSeconds && raw.growthTimesSeconds.length !== stages)
      err.push("growthTimesSeconds length must equal growthStages");
    if (stages && raw.waterRequiredPerStage && raw.waterRequiredPerStage.length !== stages)
      err.push("waterRequiredPerStage length must equal growthStages");
    if (stages && raw.diseaseChancePerStage && raw.diseaseChancePerStage.length !== stages)
      err.push("diseaseChancePerStage length must equal growthStages");
    return err;
  }

  public static fromJSON(raw: RawCropDef): CropDef {
    const errs = CropDef.validateRaw(raw);
    if (errs.length) throw new Error(`Invalid CropDef ${raw?.id ?? ""}: ${errs.join("; ")}`);
    return new CropDef(raw);
  }

  public toJSON(): RawCropDef {
    return { ...this.raw };
  }
}
