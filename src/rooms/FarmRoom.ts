import { AuthContext, Client, Room } from "colyseus";
import { BridgeClient } from "../core/infrastructures/BridgeClient";
import { UserDTO } from "../models/user";
import { IUserRepo } from "../core/repositories/IUserRepo";
import { BridgeUserRepo } from "../core/repositories/impl/BridgeUserRepo";

// src/rooms/farm.room.ts (Colyseus room)
export class FarmRoom extends Room {
  private userRepo: IUserRepo;

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
    
    // Initialize the bridge client with environment variables
    const bridgeClient = new BridgeClient({ 
      host: process.env.NAKAMA_HOST || "localhost", 
      port: Number(process.env.NAKAMA_PORT) || 7350, 
      useSSL: false, 
      serverKey: process.env.NAKAMA_SERVER_KEY || "defaultkey" 
    });
    
    this.userRepo = new BridgeUserRepo(bridgeClient);

    // Handle different message types
    this.onMessage("harvest", this.handleHarvest.bind(this));
    this.onMessage("plant", this.handlePlant.bind(this));
  }

  onJoin(client: Client, options: any) {
    const userId = client.userData?.userId;
    console.log(`Client ${client.sessionId} (userId: ${userId}) joined FarmRoom`);
    // Load user data using the real userId
    this.loadUserData(client);
  }

  onLeave(client: Client, consented: boolean) {
    const userId = client.userData?.userId;
    console.log(`Client ${client.sessionId} (userId: ${userId}) left FarmRoom`);
    // No cleanup needed since userData is automatically cleared
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

  private async handleHarvest(client: Client, message: any) {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        client.send("error", { message: "User ID not found" });
        return;
      }

      console.log(`User ${userId} (session: ${client.sessionId}) is harvesting`);
      
      const user = await this.userRepo.findOne(userId);
      if (!user) {
        client.send("error", { message: "User not found" });
        return;
      }

      // Validate harvest action (you can add more complex validation here)
      const harvestReward = 100;
      
      // Update user coins
      const updatedUser = await this.userRepo.update(user.id, { 
        coins: user.coins + harvestReward 
      });

      // Send update to client
      client.send("harvest_result", { 
        success: true, 
        reward: harvestReward,
        user: updatedUser 
      });

      // Optionally broadcast to all clients in room
      this.broadcast("player_action", { 
        playerId: userId, 
        action: "harvest",
        reward: harvestReward 
      }, { except: client });

    } catch (error) {
      console.error("Error handling harvest:", error);
      client.send("error", { message: "Failed to process harvest" });
    }
  }

  private async handlePlant(client: Client, message: any) {
    try {
      const userId = client.userData?.userId;
      if (!userId) {
        client.send("error", { message: "User ID not found" });
        return;
      }

      console.log(`User ${userId} (session: ${client.sessionId}) is planting`);
      
      const user = await this.userRepo.findOne(userId);
      if (!user) {
        client.send("error", { message: "User not found" });
        return;
      }

      const plantCost = 50;
      
      // Check if user has enough coins
      if (user.coins < plantCost) {
        client.send("error", { message: "Not enough coins to plant" });
        return;
      }

      // Deduct coins for planting
      const updatedUser = await this.userRepo.update(user.id, { 
        coins: user.coins - plantCost 
      });

      // Send update to client
      client.send("plant_result", { 
        success: true, 
        cost: plantCost,
        user: updatedUser 
      });

      // Optionally broadcast to all clients in room
      this.broadcast("player_action", { 
        playerId: userId, 
        action: "plant",
        cost: plantCost 
      }, { except: client });

    } catch (error) {
      console.error("Error handling plant:", error);
      client.send("error", { message: "Failed to process plant action" });
    }
  }
}
