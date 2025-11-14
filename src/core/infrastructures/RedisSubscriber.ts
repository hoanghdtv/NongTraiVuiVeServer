

import Redis from "ioredis";
import { Client as NakamaClient } from "@heroiclabs/nakama-js";
import { RedisPresence } from "colyseus";

/**
 * Redis Subscriber class that listens to Colyseus presence events
 * and forwards them to Nakama server
 */
export default class RedisSubscriber {
    private redisPresence: RedisPresence;
    private nakamaClient: NakamaClient;
    private channels: string[] = [];
    private isConnected: boolean = false;

    constructor(
        private redisPresence_: RedisPresence,
        private nakamaServerKey: string = "defaultkey",
        private nakamaHost: string = process.env.NAKAMA_HOST || "localhost",
        private nakamaPort: number = parseInt(process.env.NAKAMA_PORT || "7350"),
        private useSSL: boolean = process.env.USE_SSL === "true"
    ) {
        // Initialize Redis subscriber
        this.redisPresence = redisPresence_;

        // Initialize Nakama client
        this.nakamaClient = new NakamaClient(
            this.nakamaServerKey,
            this.nakamaHost,
            this.nakamaPort.toString(),
            this.useSSL
        );

        this.setupEventHandlers();
    }

    /**
     * Setup Redis event handlers
     */
    private setupEventHandlers(): void {
        this.redisPresence.subscribe("connect", () => {
            console.log("[RedisSubscriber] Connected to Redis");
            this.isConnected = true;
        });
        this.redisPresence.subscribe("message", (channel: string, message: string) => {
            this.handleMessage(channel, message);
        });
    }


    /**
     * Handle incoming Redis messages
     * @param channel Channel name
     * @param message Message payload
     * @param pattern Optional pattern if from pmessage
     */
    private async handleMessage(
        channel: string,
        message: string,
        pattern?: string
    ): Promise<void> {
        try {
            // Parse the message (assuming JSON format)
            const data = JSON.parse(message);
            
            console.log(`[RedisSubscriber] Received message from ${channel}:`, data);

            // Determine event type based on channel or message content
            const eventType = this.getEventType(channel, data);

            // Write to Nakama based on event type
            await this.writeToNakama(eventType, data, channel);
        } catch (error) {
            console.error("[RedisSubscriber] Error handling message:", error);
        }
    }

    /**
     * Determine event type from channel name or data
     */
    private getEventType(channel: string, data: any): string {
        // Colyseus presence events typically have patterns like:
        // - "room:join" or "room:leave"
        // - Channel might be "presence:room_id"
        
        if (data.event) {
            return data.event;
        }

        if (channel.includes("join")) {
            return "player_joined";
        } else if (channel.includes("leave")) {
            return "player_left";
        } else if (channel.includes("presence")) {
            return "presence_update";
        }

        return "unknown";
    }

    /**
     * Write data to Nakama server
     * @param eventType Type of event
     * @param data Event data
     * @param channel Source channel
     */
    private async writeToNakama(
        eventType: string,
        data: any,
        channel: string
    ): Promise<void> {
        try {
            // Authenticate to Nakama (using device ID or custom auth)
            // For server-to-server communication, you might want to use a service account
            const session = await this.nakamaClient.authenticateDevice(
                "redis-subscriber-service",
                true
            );

            // Write storage object or send RPC based on your needs
            // Example: Writing to storage
            const writeObject = {
                collection: "colyseus_events",
                key: `${eventType}_${Date.now()}`,
                value: JSON.stringify({
                    eventType,
                    channel,
                    data,
                    timestamp: new Date().toISOString(),
                }),
                permission_read: 2, // Public read
                permission_write: 0, // No client write
            };

            // Note: You may need to create a socket connection for real-time features
            // Or use the RPC endpoint if you have custom Nakama server modules
            
            console.log(`[RedisSubscriber] Writing to Nakama:`, {
                eventType,
                channel,
                dataPreview: JSON.stringify(data).substring(0, 100),
            });

            // Alternative: Use RPC to call a custom Nakama function
            // await this.nakamaClient.rpc(session, "process_colyseus_event", JSON.stringify({
            //     eventType,
            //     channel,
            //     data,
            // }));

        } catch (error) {
            console.error("[RedisSubscriber] Error writing to Nakama:", error);
        }
    }

    /**
     * Check if subscriber is connected
     */
    public getConnectionStatus(): boolean {
        return this.isConnected;
    }

    /**
     * Get list of subscribed channels
     */
    public getChannels(): string[] {
        return [...this.channels];
    }
}