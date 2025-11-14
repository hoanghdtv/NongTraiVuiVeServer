// src/systems/ISystem.ts
import { FarmState, ActionResult, PlayerContext } from "../models";

export interface ISystem {
  init(state: FarmState): void;                     // load snapshot
  onTick?(deltaMs: number, state: FarmState): void; // optional periodic updates
  validateAction(action: any, ctx: PlayerContext, state: FarmState): ActionResult;
  applyAction(action: any, ctx: PlayerContext, state: FarmState): ActionResult;
  getStateSlice(): any; // snapshot of this system
}
