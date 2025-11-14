// types.ts
export type Currency = "GOLD" | "COIN" | string;

export interface Size { w: number; h: number; }
export interface Cost { gold?: number; materials?: Record<string, number>; }
export interface Upgrade {
  level: number;
  cost?: Cost;
  buildTimeSeconds?: number;
  capacityMultiplier?: number;
  extra?: Record<string, any>;
}
export interface Placement { canOverlap?: boolean; requiresFoundation?: boolean; }
export interface Production {
  type: string;
  input?: Record<string, number>;
  output?: Record<string, number>;
  cycleSeconds?: number;
  extra?: Record<string, any>;
}


// crops
export type Season = "spring" | "summer" | "autumn" | "winter" | string;

export interface GrowthTimes { // length = growthStages
  timesSeconds: number[]; 
}
export interface YieldRange { min: number; max: number; }
export interface SpecialEffects { [k: string]: any; }
