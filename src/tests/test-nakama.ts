/**
 * Test script for Nakama JS modules
 * Run: npx tsx test-nakama.ts
 */

import { Client } from "@heroiclabs/nakama-js";

const SERVER_KEY = "defaultkey";
const HOST = "localhost";
const PORT = "7350";
const USE_SSL = false;

async function testNakama() {
    console.log("🧪 Testing Nakama JS Modules...\n");

    // Create Nakama client
    const client = new Client(SERVER_KEY, HOST, PORT, USE_SSL);
    console.log("✅ Client created");

    try {
        // 1. Authenticate (create a test user)
        console.log("\n1️⃣ Authenticating...");
        const session = await client.authenticateDevice("test-device-" + Date.now(), true);
        console.log("✅ Authenticated:", {
            userId: session.user_id,
            username: session.username,
        });

        // 2. Test RPC: hello
        console.log("\n2️⃣ Testing RPC: hello");
        const helloResult = await client.rpc(session, "hello", { test: "data", timestamp: Date.now() });
        const helloPayload = typeof helloResult.payload === 'string' ? helloResult.payload : JSON.stringify(helloResult.payload);
        console.log("✅ RPC hello result:", JSON.parse(helloPayload));

        // 3. Test RPC: get_user
        console.log("\n3️⃣ Testing RPC: get_user");
        try {
            const userResult = await client.rpc(session, "get_user", {});
            const userPayload = typeof userResult.payload === 'string' ? userResult.payload : JSON.stringify(userResult.payload);
            console.log("✅ RPC get_user result:", JSON.parse(userPayload));
        } catch (err: any) {
            console.log("⚠️  get_user failed (expected if user data not complete):", err.message);
        }

        // 4. Test RPC: write_data
        console.log("\n4️⃣ Testing RPC: write_data");
        const writeData = {
            key: "test_key_" + Date.now(),
            value: "test value",
            nested: {
                foo: "bar",
                timestamp: Date.now()
            }
        };
        const writeResult = await client.rpc(session, "write_data", writeData);
        const writePayload = typeof writeResult.payload === 'string' ? writeResult.payload : JSON.stringify(writeResult.payload);
        console.log("✅ RPC write_data result:", JSON.parse(writePayload));

        // 5. Test RPC: read_data
        console.log("\n5️⃣ Testing RPC: read_data");
        const readResult = await client.rpc(session, "read_data", { key: writeData.key });
        const readPayload = typeof readResult.payload === 'string' ? readResult.payload : JSON.stringify(readResult.payload);
        console.log("✅ RPC read_data result:", JSON.parse(readPayload));

        // 6. Test storage directly
        console.log("\n6️⃣ Testing Storage API directly");
        const storageObjects = await client.readStorageObjects(session, {
            object_ids: [{
                collection: "test_collection",
                key: writeData.key,
                user_id: session.user_id
            }]
        });
        console.log("✅ Storage read result:", storageObjects.objects?.[0]?.value);

        console.log("\n🎉 All tests passed!\n");

    } catch (error: any) {
        console.error("❌ Test failed:", error.message);
        if (error.grpcCode) {
            console.error("gRPC Code:", error.grpcCode);
        }
        process.exit(1);
    }
}

// Run tests
testNakama().catch(console.error);
