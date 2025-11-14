// src/systems/buildings/templateRegistry.ts
import { BuildingDef } from "./types";

/**
 * In-memory registry for building templates/definitions.
 * You can load from JSON, DB, or hard-code defaults.
 */
export const DEFAULT_TEMPLATES: Record<string, BuildingDef> = {
  house: { id: "house", width: 2, height: 2, base_hp: 100, max_level: 3, upgrade_cost: [{ gold: 50 }, { gold: 100 }] },
  barn: { id: "barn", width: 3, height: 3, base_hp: 150, max_level: 5, upgrade_cost: [{ gold: 100 }, { gold: 200 }, { gold: 400 }] },
};

export interface TemplateRegistry {
  get(templateId: string): BuildingDef | undefined;
}

export function createTemplateRegistry(overrides?: Record<string, BuildingDef>): TemplateRegistry {
  const templates = { ...DEFAULT_TEMPLATES, ...overrides };
  
  return {
    get(templateId: string): BuildingDef | undefined {
      return templates[templateId];
    }
  };
}
