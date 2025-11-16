import { BuildingDef } from "./types";
import { exampleConfig } from "../../shared/configs/game-configs";

// Default building templates from shared config
const DEFAULT_TEMPLATES: Record<string, BuildingDef> = exampleConfig.building_defs;
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
