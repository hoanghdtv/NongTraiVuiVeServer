import { AuthContext, Client, Room } from "colyseus";
import { BridgeClient } from "../core/infrastructures/BridgeClient";
import { UserDTO } from "../models/user";
import { IUserRepo } from "../core/repositories/IUserRepo";
import { BridgeUserRepo } from "../core/repositories/impl/BridgeUserRepo";
import { ISystem } from "../systems/ISystem";
import { createBuildingsSystem } from "../systems/building/BuildingSystem";
import { ActionEnvelope, ActionContext, createActionEnvelope, createActionContext } from "../models/ActionEnvelope";
import { exampleConfig, FarmState } from "../shared";
import { GameState } from "./GameState";


const ACTION_ROUTER: Record<string, string> = {
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

// src/rooms/farm.room.ts (Colyseus room)
export class FarmRoom extends Room<GameState> {
  private userRepo: IUserRepo;
  private systems: Record<string, ISystem> = {};
   private incomingQueue = new Array<ActionEnvelope>();
   private farmState: FarmState;
   private dirty = false;
   state: GameState = new GameState();

  async onAuth(client: Client<any, any>, options: any, context: AuthContext): Promise<boolean> {
    try {
      // Validate user credentials and extract userId
      // options should contain userId or token that can be verified
      const userId = options.userId || options.user_id;
      
      if (!userId) {
        console.error("No userId provided in auth options");
        return false;
      }

      // Store userId in client.userData for later use
      // This is safer than using sessionId mapping since onAuth is called before onJoin
      client.userData = { userId };
      
      // You could add additional validation here:
      // - Verify token with Nakama
      // - Check if user exists in database
      // - Validate user permissions
      
      console.log(`Auth successful for userId: ${userId}`);
      return true;
    } catch (error) {
      console.error("Auth error:", error);
      return false;
    }
  }

  onCreate(options: any) {
    console.log("FarmRoom created!", options);

    this.systems["buildings"] = createBuildingsSystem();
    
    // Initialize the bridge client with environment variables
    const bridgeClient = new BridgeClient({ 
      host: process.env.NAKAMA_HOST || "localhost", 
      port: Number(process.env.NAKAMA_PORT) || 7350, 
      useSSL: false, 
      serverKey: process.env.NAKAMA_SERVER_KEY || "defaultkey" 
    });
    
    this.userRepo = new BridgeUserRepo(bridgeClient);

    this.setSimulationInterval(() => this.processQueue(), 50);


    // Register message handlers for all action types
    this.onMessage("*", (client: Client, type: string | number, message: any) => {
      this.handleAction(client, type as string, message);
    });
  }

  private handleAction(client: Client, type: string, message: any) {
    const userId = client.userData?.userId;
    if (!userId) {
      client.send("error", { message: "User not authenticated" });
      return;
    }

    // Create action context
    const ctx = createActionContext(client.sessionId, userId, { type });
    
    // Create action envelope
    const actionEnvelope = createActionEnvelope(type, message, ctx);
    
    // Add to processing queue
    this.incomingQueue.push(actionEnvelope);
    
    console.log(`Action queued: ${type} from user ${userId}`);
  }

  onJoin(client: Client, options: any) {
    const userId = client.userData?.userId;
    console.log(`Client ${client.sessionId} (userId: ${userId}) join FarmRoom`);
    // No cleanup needed since userData is automatically cleared

    // send game config
    this.sendGameConfig(client);
    // load user data 
    this.loadUserData(client);
  }
  onLeave(client: Client<any, any>, consented?: boolean): void | Promise<any> {
    const userId = client.userData?.userId;
    console.log(`Client ${client.sessionId} (userId: ${userId}) left FarmRoom`);
    // No cleanup needed since userData is automatically cleared
  }
  sendGameConfig(client: Client<any, any>) {
    client.send("game_config", JSON.stringify(exampleConfig));
  }

  onDispose() {
    console.log("FarmRoom disposing...");
  }

  private async loadUserData(client: Client) {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        client.send("error", { message: "User ID not found" });
        return;
      }

      const user = await this.userRepo.findOne(userId);
      if (user) {
        client.send("user_data", { user });
      } else {
        // Create new user if not exists
        const newUser: UserDTO = {
          id: userId,
          name: `Player_${userId.substring(0, 8)}`,
          coins: 100 // starting coins
        };
        const savedUser = await this.userRepo.save(newUser);
        client.send("user_data", { user: savedUser });
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      client.send("error", { message: "Failed to load user data" });
    }
  }

  processQueue() {
    while (this.incomingQueue.length) {
      const env = this.incomingQueue.shift();
      if (!env) continue;
      
      const systemId = ACTION_ROUTER[env.actionType];
      if (!systemId) {
        console.warn(`Unknown action type: ${env.actionType}`);
        continue;
      }
      
      const system = this.systems[systemId];
      if (!system) {
        console.warn(`No system found for: ${systemId}`);
        continue;
      }
      
      try {
        const validation = system.validateAction(env.payload, env.ctx, this.state);
        if (!validation.ok) { 
          // Send error back to client
          this.clients.find(c => c.sessionId === env.ctx.clientId)?.send("action_error", {
            actionType: env.actionType,
            error: validation.error || "Invalid action"
          });
          continue;
        }
        
        const result = system.applyAction(env.payload, env.ctx, this.state);
        if (this.state) {
          this.state.version = (this.state.version || 0) + 1;
        }
        this.dirty = true;
        
        this.broadcast("event", { 
          actionType: env.actionType, 
          result, 
          version: this.state?.version 
        });
      } catch (error) {
        console.error(`Error processing action ${env.actionType}:`, error);
        this.clients.find(c => c.sessionId === env.ctx.clientId)?.send("action_error", {
          actionType: env.actionType,
          error: "Internal server error"
        });
      }
    }
  }
}
