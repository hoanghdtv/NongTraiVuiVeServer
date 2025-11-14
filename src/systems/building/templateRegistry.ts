// src/systems/buildings/templateRegistry.ts
import { BuildingTemplate } from "./types";

/**
 * Server-side template registry.
 * Extend / persist templates here. IMPORTANT: do NOT accept template shapes from client.
 */
export const DEFAULT_TEMPLATES: Record<string, BuildingTemplate> = {
  barn: { templateId: "barn", width: 3, height: 2, maxLevel: 5, cost: { coins: 500, wood: 100 }, buildTimeSec: 60 },
  small_shed: { templateId: "small_shed", width: 1, height: 1, maxLevel: 3, cost: { coins: 50, wood: 10 }, buildTimeSec: 10 },
  well: { templateId: "well", width: 1, height: 1, maxLevel: 1, cost: { coins: 200 }, buildTimeSec: 0 },
};

export type TemplateRegistry = {
  get(templateId: string): BuildingTemplate | undefined;
};

export function createTemplateRegistry(overrides?: Record<string, BuildingTemplate>): TemplateRegistry {
  const map = { ...DEFAULT_TEMPLATES, ...(overrides || {}) };
  return {
    get(templateId: string) {
      return map[templateId];
    },
  };
}
