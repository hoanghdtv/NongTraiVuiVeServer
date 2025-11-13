# Redis-to-Nakama Bridge

This bridge connects Colyseus presence events (via Redis) to Nakama server.

## Features

- ✅ Subscribe to Redis channels for Colyseus presence events
- ✅ Pattern-based subscription (e.g., `room:*:join`)
- ✅ Automatic reconnection on Redis connection failures
- ✅ Forward events to Nakama storage or RPC
- ✅ Graceful shutdown handling
- ✅ Type-safe TypeScript implementation

## Installation

Install required dependencies:

```bash
npm install --save ioredis @heroiclabs/nakama-js
npm install --save-dev @types/ioredis
```

## Configuration

Set the following environment variables:

```bash
# Redis connection
REDIS_URL=redis://localhost:6379

# Nakama connection
NAKAMA_HOST=localhost
NAKAMA_PORT=7350
NAKAMA_SERVER_KEY=defaultkey
```

## Usage

The bridge is automatically initialized in `app.config.ts` when `REDIS_URL` is set.

### Basic Usage

```typescript
import RedisSubscriber from "./bridge/redisSubscriber";

const subscriber = new RedisSubscriber(
    "redis://localhost:6379",  // Redis URL
    "defaultkey",              // Nakama server key
    "localhost",               // Nakama host
    7350,                      // Nakama port
    false                      // Use SSL
);

// Subscribe to Colyseus presence events
await subscriber.subscribeToColyseusPresence();
```

### Custom Channel Subscription

```typescript
// Subscribe to specific channels
await subscriber.subscribe(["room:game:join", "room:game:leave"]);

// Subscribe with patterns
await subscriber.psubscribe(["room:*", "matchmaker:*"]);
```

### Event Flow

1. **Colyseus** publishes presence events to Redis
2. **RedisSubscriber** listens to these events
3. Events are parsed and categorized
4. **Nakama** receives the processed events via:
   - Storage API (default)
   - RPC calls (optional)

### Event Types

The bridge handles these event types:

- `player_joined` - When a player joins a room
- `player_left` - When a player leaves a room
- `presence_update` - General presence updates
- `unknown` - Other events

### Nakama Integration

Events are written to Nakama storage under the `colyseus_events` collection:

```json
{
  "collection": "colyseus_events",
  "key": "player_joined_1699876543210",
  "value": {
    "eventType": "player_joined",
    "channel": "room:game:join",
    "data": { /* event data */ },
    "timestamp": "2025-11-13T12:00:00.000Z"
  }
}
```

### Custom Nakama Processing

To use custom Nakama server logic, modify the `writeToNakama` method to call your RPC:

```typescript
// In redisSubscriber.ts, replace storage write with RPC call:
await this.nakamaClient.rpc(
    session,
    "process_colyseus_event",
    JSON.stringify({
        eventType,
        channel,
        data,
    })
);
```

Then create a corresponding Nakama server module (Go/Lua/TypeScript).

## Colyseus Room Integration

In your Colyseus rooms, you can publish custom events to Redis:

```typescript
import { Room, Client } from "@colyseus/core";

export class MyRoom extends Room {
    onJoin(client: Client, options: any) {
        // Publish custom event
        this.presence.publish("room:custom:event", {
            roomId: this.roomId,
            playerId: client.sessionId,
            action: "player_joined",
            data: options
        });
    }
}
```

## Monitoring

Check connection status:

```typescript
const isConnected = subscriber.getConnectionStatus();
console.log("Subscriber connected:", isConnected);

const channels = subscriber.getChannels();
console.log("Subscribed channels:", channels);
```

## Graceful Shutdown

The bridge automatically handles graceful shutdown on SIGINT, SIGTERM, and SIGQUIT signals:

```typescript
// Manual shutdown
await subscriber.shutdown();
```

## Troubleshooting

### Redis Connection Issues

```bash
# Check if Redis is running
docker ps | grep redis

# Test Redis connection
redis-cli -h localhost -p 6379 ping
```

### Nakama Connection Issues

```bash
# Check if Nakama is running
curl http://localhost:7350/healthcheck

# Check Nakama logs
docker logs nakama
```

### Debug Messages

Enable debug logging by checking console output:
- `[RedisSubscriber] Connected to Redis`
- `[RedisSubscriber] Subscribed to channels: ...`
- `[RedisSubscriber] Received message from ...`
- `[RedisSubscriber] Writing to Nakama: ...`

## Architecture

```
┌──────────────┐
│   Colyseus   │
│    Rooms     │
└──────┬───────┘
       │
       │ publish events
       ▼
┌──────────────┐
│    Redis     │
│  (Presence)  │
└──────┬───────┘
       │
       │ subscribe
       ▼
┌──────────────┐
│    Redis     │
│  Subscriber  │
└──────┬───────┘
       │
       │ forward events
       ▼
┌──────────────┐
│    Nakama    │
│    Server    │
└──────────────┘
```

## License

Same as the parent project.
