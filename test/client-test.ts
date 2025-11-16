import { Client, Room } from "colyseus.js";
import { Client as NakamaClient } from "@heroiclabs/nakama-js";

// Note: Install colyseus.js client with: npm install colyseus.js
// For browser usage, you might also need: npm install ws

// Types for room state (should match server-side types)
interface FarmRoomState {
  players: { [sessionId: string]: PlayerData };
  buildings: { [buildingId: string]: any };
  tick: number;
}

interface PlayerData {
  sessionId: string;
  userId?: string;
  name?: string;
  gold: number;
  isReady: boolean;
}

class ColyseusTestClient {
  private client: Client;
  private room: Room<FarmRoomState> | null = null;

  constructor(serverUrl: string = "ws://localhost:2567") {
    this.client = new Client(serverUrl);
  }

  async connectToFarm(options: { userId?: string; token?: string } = {}) {
    try {
      console.log("🔌 Connecting to FarmRoom...");
      
      this.room = await this.client.joinOrCreate<FarmRoomState>("FarmRoom", {
        userId: options.userId || `user_${Date.now()}`,
        token: options.token || `Player_${Math.random().toString(36).substring(2, 8)}`
      });

      console.log("✅ Connected to FarmRoom:", this.room.sessionId);
      this.setupRoomHandlers();
      
      return this.room;
    } catch (error) {
      console.error("❌ Failed to connect to FarmRoom:", error);
      throw error;
    }
  }

  private setupRoomHandlers() {
    if (!this.room) return;

    // Handle state changes
    this.room.onStateChange((state) => {
    //   console.log("🔄 Room state changed:", {
    //     tick: state.tick,
    //     playerCount: Object.keys(state.players).length,
    //     buildingCount: Object.keys(state.buildings).length
    //   });
    // });
    // console.log("🔄 Room state changed:" + JSON.stringify(state));
    });

    // Handle room messages for player events
    this.room.onMessage("player_joined", (data) => {
      console.log("👤 Player joined:", data);
    });

    this.room.onMessage("player_left", (data) => {
      console.log("👋 Player left:", data);
    });

    this.room.onMessage("building_placed", (data) => {
      console.log("🏗️ Building placed:", data);
    });

    this.room.onMessage("building_removed", (data) => {
      console.log("🗒️ Building removed:", data);
    });

    // Handle room messages
    this.room.onMessage("*", (type, message) => {
      console.log("📨 Message received:", type, message);
    });

    // Handle errors
    this.room.onError((code, message) => {
      console.error("❌ Room error:", code, message);
    });

    // Handle room leave
    this.room.onLeave((code) => {
      console.log("🚪 Left room with code:", code);
    });
  }

  // Test actions
  async testPlaceBuilding(defId: string = "barn", position: { x: number; y: number } = { x: 5, y: 5 }) {
    if (!this.room) {
      console.error("❌ Not connected to room");
      return;
    }

    console.log("🏗️ Testing place building:", { defId, position });
    
    try {
      this.room.send("place_building", {
        defId,
        origin: position,
        rotation: 0
      });
    } catch (error) {
      console.error("❌ Failed to place building:", error);
    }
  }

  async testRemoveBuilding(buildingId: string) {
    if (!this.room) {
      console.error("❌ Not connected to room");
      return;
    }

    console.log("🗒️ Testing remove building:", buildingId);
    
    try {
      this.room.send("remove_building", { buildingId });
    } catch (error) {
      console.error("❌ Failed to remove building:", error);
    }
  }

  async testUpgradeBuilding(buildingId: string) {
    if (!this.room) {
      console.error("❌ Not connected to room");
      return;
    }

    console.log("⬆️ Testing upgrade building:", buildingId);
    
    try {
      this.room.send("upgrade_building", { buildingId });
    } catch (error) {
      console.error("❌ Failed to upgrade building:", error);
    }
  }

  async testGetGameConfig() {
    if (!this.room) {
      console.error("❌ Not connected to room");
      return;
    }

    console.log("⚙️ Testing get game config");
    
    try {
      this.room.send("get_game_config", {});
    } catch (error) {
      console.error("❌ Failed to get game config:", error);
    }
  }

  async disconnect() {
    if (this.room) {
      console.log("👋 Disconnecting from room...");
      await this.room.leave();
      this.room = null;
    }
  }

  // Utility methods
  getCurrentState(): FarmRoomState | null {
    return this.room?.state || null;
  }

  getMyPlayer() {
    if (!this.room) return null;
    return this.room.state.players[this.room.sessionId];
  }

  getAllBuildings() {
    if (!this.room) return {};
    return this.room.state.buildings;
  }
}

// Test runner
async function runTests() {
  console.log("🚀 Starting Colyseus Client Tests");
  
  const client = new ColyseusTestClient();
  
  try {

    // write code to connect to nakama server to get session token
    // using authen with device id or custom id could be added here
    // Connect to Nakama server to get session token

    const nakamaClient = new NakamaClient(undefined, "127.0.0.1", "7350",false);

    // Authenticate with device ID (or custom ID)
    const deviceId = "test_device_123";
    console.log("🔐 Authenticating with Nakama using device ID:", deviceId);

    const session = await nakamaClient.authenticateDevice(deviceId, true);
    console.log("✅ Nakama session created:", session.token);

    // You can now use session.token for authenticated requests to your game server

    // Connect to room
    await client.connectToFarm({
        userId: session.user_id,
        token: session.token
    });

    // Wait a bit for connection to stabilize
    await new Promise(resolve => setTimeout(resolve, 10000));

    // // Test placing a building
    // await client.testPlaceBuilding("barn", { x: 5, y: 5 });

    // await client.testGetGameConfig();
    
    // // Wait for state update
    // await new Promise(resolve => setTimeout(resolve, 500));

    // // Test placing another building
    // await client.testPlaceBuilding("silo", { x: 10, y: 5 });
    
    // // Wait for state update
    // await new Promise(resolve => setTimeout(resolve, 500));

    // Get current state
    // const state = client.getCurrentState();
    // console.log("📊 Current state:", state);

    // Test upgrading a building (if any exist)
    // const buildings = client.getAllBuildings();
    // const buildingIds = Object.keys(buildings);
    // if (buildingIds.length > 0) {
    //   await client.testUpgradeBuilding(buildingIds[0]);
    //   await new Promise(resolve => setTimeout(resolve, 500));
    // }

    // Keep connection alive for a while to observe state changes
    console.log("⏰ Keeping connection alive for 10 seconds...");
    await new Promise(resolve => setTimeout(resolve, 10000));

  } catch (error) {
    console.error("💥 Test failed:", error);
  } finally {
    // Clean up
    await client.disconnect();
    console.log("✅ Tests completed");
  }
}

// Export for use in other files
export { ColyseusTestClient, runTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}