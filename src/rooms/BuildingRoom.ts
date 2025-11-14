// // BuildingRoom.ts
// import { Room, Client } from "colyseus";
// import axios from "axios";
// import { GridService } from "../systems/building/impl/GridService";
// import { BuildingTemplate, GridCoord } from "../systems/building/types";

// const NAKAMA_PERSIST_URL = process.env.NAKAMA_PERSIST_URL || "http://backend/save_farm";
// const NAKAMA_SERVER_KEY = process.env.NAKAMA_SERVER_KEY || "";

// type AuthData = { userId: string, username?: string };

// export class BuildingRoom extends Room {
//   private gridService = new GridService(30, 30); // width x height per room/user mapping depends on your architecture
//   private userId?: string;
//   private dirty = false;
//   private persistTimer?: NodeJS.Timeout;

//   onCreate(options: any) {
//     this.setState({}); // not using Colyseus schema here; using our service snapshot
//     // autosave every 3s if dirty
//     this.setSimulationInterval(() => {
//       if (this.dirty) this.persistSnapshot();
//     }, 3000);
//   }

//   async onAuth(client: Client, options: any) {
//     // options.nakama_token already provided by client
//     const token = options?.nakama_token;
//     if (!token) throw new Error("missing_token");

//     try {
//       const resp = await axios.get(`${process.env.NAKAMA_URL || "http://nakama:7350"}/v2/account`, {
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 2000,
//       });
//       const account = resp.data;
//       return { userId: account.user_id, username: account.username };
//     } catch (err: any) {
//       throw new Error("invalid_token");
//     }
//   }

//   async onJoin(client: Client, options: any, auth: AuthData) {
//     client.metadata = { userId: auth.userId };
//     this.userId = auth.userId;
//     // load snapshot from persistence (Nakama or backend)
//     const snapshot = await this.loadSnapshot(auth.userId);
//     if (snapshot) this.gridService.init(snapshot);
//     // send initial snapshot
//     client.send("init_snapshot", this.gridService.getSnapshot());
//   }

//   onLeave(client: Client, consented: boolean) {
//     // schedule save
//     this.markDirty();
//   }

//   onDispose() {
//     if (this.persistTimer) clearTimeout(this.persistTimer);
//   }

//   // client messages:
//   async onMessage(client: Client, message: any) {
//     const userId = client.metadata?.userId;
//     if (!userId) { client.send("error", { message: "not_authed" }); return; }

//     const { action, payload } = message;

//     try {
//       if (action === "place_building") {
//         const template: BuildingTemplate = payload.template;
//         const origin: GridCoord = payload.origin;
//         // server must validate template from its registry rather than trust client template
//         // For demo: assume template valid
//         if (!this.gridService.canPlaceBuilding(userId, origin, template)) {
//           client.send("action_failed", { action, reason: "cannot_place" });
//           return;
//         }
//         // optional: check user resources via Nakama before actually placing (avoid griefing)
//         // e.g., const ok = await this.checkUserHasResources(userId, template.cost)
//         const placed = this.gridService.placeBuilding(userId, origin, template);
//         // store template sizes into meta to allow remove later
//         placed.meta = { width: template.width, height: template.height };
//         this.markDirty();
//         // broadcast to all in room
//         this.broadcast("building_placed", { building: placed, version: this.gridService.getSnapshot().version });
//       }

//       else if (action === "remove_building") {
//         const { buildingId } = payload;
//         if (!this.gridService.canRemoveBuilding(userId, buildingId)) {
//           client.send("action_failed", { action, reason: "cannot_remove" });
//           return;
//         }
//         this.gridService.removeBuilding(userId, buildingId);
//         this.markDirty();
//         this.broadcast("building_removed", { buildingId, version: this.gridService.getSnapshot().version });
//       }

//       else if (action === "upgrade_building") {
//         const { buildingId } = payload;
//         if (!this.gridService.canUpgradeBuilding(userId, buildingId)) {
//           client.send("action_failed", { action, reason: "cannot_upgrade" });
//           return;
//         }
//         const updated = this.gridService.upgradeBuilding(userId, buildingId);
//         this.markDirty();
//         this.broadcast("building_upgraded", { building: updated, version: this.gridService.getSnapshot().version });
//       }

//       else {
//         client.send("error", { message: "unknown_action" });
//       }
//     } catch (err: any) {
//       client.send("action_failed", { action, reason: err.message || "error" });
//     }
//   }

//   private markDirty() {
//     this.dirty = true;
//     if (this.persistTimer) clearTimeout(this.persistTimer);
//     // persist after short debounce
//     this.persistTimer = setTimeout(() => this.persistSnapshot(), 1500);
//   }

//   private async persistSnapshot() {
//     if (!this.dirty) return;
//     this.dirty = false;
//     const snapshot = this.gridService.getSnapshot();
//     // attach user id for persistence
//     snapshot.userId = this.userId || snapshot.userId;
//     // Call your backend/Nakama RPC to persist (server-side must validate and version)
//     try {
//       await axios.post(NAKAMA_PERSIST_URL, snapshot, {
//         headers: { "x-server-key": NAKAMA_SERVER_KEY },
//         timeout: 5000,
//       });
//       // success: optionally broadcast ack
//       this.broadcast("persist_ok", { version: snapshot.version });
//     } catch (err) {
//       console.error("persist failed", err?.message || err);
//       // mark dirty again for retry
//       this.dirty = true;
//     }
//   }

//   private async loadSnapshot(userId: string) {
//     try {
//       const resp = await axios.get(`${NAKAMA_PERSIST_URL}?userId=${encodeURIComponent(userId)}`, {
//         headers: { "x-server-key": NAKAMA_SERVER_KEY },
//         timeout: 3000,
//       });
//       return resp.data.snapshot;
//     } catch (err) {
//       console.warn("load snapshot failed", err?.message || err);
//       return null;
//     }
//   }
// }
