// src/repositories/bridgeUserRepo.ts

import { UserDTO } from "../../../models/user";
import { BridgeClient } from "../../infrastructures/BridgeClient";
import { IUserRepo } from "../IUserRepo";


export class BridgeUserRepo implements IUserRepo {
  constructor(private bridge: BridgeClient) {}

  async findOne(id: string): Promise<UserDTO | null> {
    return this.bridge.rpc<UserDTO | null>("user.get", { id });
  }

  async save(user: UserDTO): Promise<UserDTO> {
    // ensure idempotency: use upsert on bridge side
    return this.bridge.rpc<UserDTO>("user.save", { user });
  }

  async update(id: string, patch: Partial<UserDTO>): Promise<UserDTO> {
    return this.bridge.rpc<UserDTO>("user.update", { id, patch });
  }

  async remove(id: string): Promise<void> {
    await this.bridge.rpc("user.remove", { id });
  }
}
