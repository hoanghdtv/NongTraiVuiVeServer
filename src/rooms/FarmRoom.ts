import { Client, Room } from "colyseus";
import { IUserRepo } from "../repositories/IUserRepo";
import { BridgeUserRepo } from "../repositories/impl/BridgeUserRepo";
import { BridgeClient } from "../infrastructures/bridge/BridgeClient";

// src/rooms/farm.room.ts (Colyseus room)
class FarmRoom extends Room {
  private userRepo: IUserRepo;

  onCreate (options: any) {
    // this.userRepo = new BridgeUserRepo(new BridgeClient("http://bridge:3000"));
  }

//   async onMessage(client : Client, message: any) {
//     if (message.action === "harvest") {
//       // xử lý ở memory
//       const user = await this.userRepo.findOne(client.sessionId);
//       // validate, compute reward
//       const newUser = await this.userRepo.update(user.id, { coins: user.coins + 100 });
//       this.send(client, { type: "update", user: newUser });
//     }
//   }
}
