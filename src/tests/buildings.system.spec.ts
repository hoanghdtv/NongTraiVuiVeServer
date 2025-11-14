// src/systems/buildings/__tests__/buildings.system.spec.ts
import { createBuildingsSystem } from "../systems/building/BuildingSystem";
import { createTemplateRegistry } from "../systems/building/templateRegistry";

describe("BuildingsSystem", () => {
  it("places and removes building", async () => {
    const sys = createBuildingsSystem({ templateRegistry: createTemplateRegistry(), bounds: { width: 10, height: 10 } });
    sys.init();
    const ctx = { userId: "u1", sessionId: "s1" } as any;
    const validate = sys.validateAction({ type: "place_building", payload: { templateId: "small_shed", origin: { x: 0, y: 0 } } }, ctx, {});
    expect(validate.ok).toBe(true);

    const res = await sys.applyAction({ type: "place_building", payload: { templateId: "small_shed", origin: { x: 0, y: 0 } } }, ctx, {});
    expect(res.ok).toBe(true);
    expect(res.stateDelta?.buildings?.added?.length).toBe(1);

    const placed = res.stateDelta!.buildings!.added[0];
    const removeValidate = sys.validateAction({ type: "remove_building", payload: { buildingId: placed.id } }, ctx, {});
    expect(removeValidate.ok).toBe(true);
    const removeRes = await sys.applyAction({ type: "remove_building", payload: { buildingId: placed.id } }, ctx, {});
    expect(removeRes.ok).toBe(true);
  });
});
