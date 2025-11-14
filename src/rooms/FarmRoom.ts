// src/core/FarmRoom.ts (sketch)
import { Room, Client } from "colyseus";
import { createBuildingsSystem } from "../systems/building";
import { globalTemplateRegistry } from "../systems/building/templateRegistry";
import { ISystem } from "../core/systems/ISystem";
import { FarmState } from "../core/state/FarmState";
import { ActionEnvelope } from "../core/actions/ActionEnvelope";
import { verifyNakamaToken } from "../core/auth/verifyNakamaToken";
import { createCropsSystem } from "../systems/crops";
import { loadSnapshot, persistSnapshot } from "../core/persistence";

const ACTION_ROUTER = {
  "plant.crop": "crops",
  "harvest.crop": "crops",
  "place.building": "buildings",
  "remove.building": "buildings",
  "upgrade.building": "buildings",
  "feed.animal": "animals",
  "collect.product": "animals",
  "sell.item": "economy",
  "move.inventory": "inventory",
};


export class FarmRoom extends Room {
  private state: FarmState;
  private systems: Record<string, ISystem> = {};
  private incomingQueue = new Array<ActionEnvelope>();
  private dirty = false;

  onCreate(opts) {
    // register systems
    this.systems["buildings"] = createBuildingsSystem(globalTemplateRegistry);
    this.systems["crops"] = createCropsSystem(...);
    // tick loop
    this.setSimulationInterval((dt) => this.onTick(dt), 1000);
    // process loop
    this.setSimulationInterval(() => this.processQueue(), 50);
  }

  async onJoin(client: Client, opts) {
    const auth = await verifyNakamaToken(opts.nakama_token);
    this.state = await loadSnapshot(auth.userId) || createEmptyState(auth.userId);
    // init systems
    for (const id of Object.keys(this.systems)) {
      this.systems[id].init(this.state);
    }
    client.send("init_snapshot", this.state);
  }

  enqueueAction(action: ActionEnvelope) {
    this.incomingQueue.push(action);
  }

  processQueue() {
    while (this.incomingQueue.length) {
      const env = this.incomingQueue.shift();
      const systemId = ACTION_ROUTER[env.actionType];
      const system = this.systems[systemId];
      const validation = system.validateAction(env.payload, env.ctx, this.state);
      if (!validation.ok) { /* reply error */ continue; }
      const result = system.applyAction(env.payload, env.ctx, this.state);
      this.state.version++;
      this.dirty = true;
      this.broadcast("event", { actionType: env.actionType, result, version: this.state.version });
    }
  }

  async onTick(deltaMs) {
    for (const s of Object.values(this.systems)) {
      if (s.onTick) s.onTick(deltaMs, this.state);
    }
    if (this.dirty) this.schedulePersist();
  }

  schedulePersist() { /* debounce then call persistSnapshot(state) */ }
}
