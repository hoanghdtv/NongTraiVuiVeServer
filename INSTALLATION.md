# Installation Instructions

## Required Dependencies

Run the following command to install the necessary packages:

```bash
npm install --save ioredis @heroiclabs/nakama-js
npm install --save-dev @types/ioredis
```

## Environment Variables

Create or update your `.env.development` file:

```bash
# Redis Configuration
REDIS_URL=redis://localhost:6379

# Nakama Configuration
NAKAMA_HOST=localhost
NAKAMA_PORT=7350
NAKAMA_SERVER_KEY=defaultkey

# Optional
NODE_ENV=development
PORT=2567
```

## Docker Setup

If using Docker Compose, the services are already configured in `docker-compose.yml`:

```bash
# Start all services (Redis, Nakama, PostgreSQL, Colyseus)
docker compose up --build

# Or start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Running Locally (Without Docker)

1. Make sure Redis is running:
```bash
# Using Docker
docker run -d -p 6379:6379 redis:7

# Or install Redis locally
brew install redis  # macOS
redis-server
```

2. Make sure Nakama is running:
```bash
# Use the docker-compose in nakama folder
cd nakama
docker compose up -d
cd ..
```

3. Start the Colyseus server:
```bash
npm install
npm run build
npm start
```

## Verifying the Setup

1. **Check Redis connection:**
```bash
redis-cli -h localhost -p 6379 ping
# Should return: PONG
```

2. **Check Nakama:**
```bash
curl http://localhost:7350/healthcheck
# Should return: OK
```

3. **Check Colyseus:**
```bash
curl http://localhost:2567/hello_world
# Should return: It's time to kick ass and chew bubblegum!
```

4. **Monitor logs:**
- Look for `[RedisSubscriber] Connected to Redis`
- Look for `[Bridge] RedisSubscriber initialized`
- Look for `[App] Redis-to-Nakama bridge initialized`

## Testing the Bridge

You can test the bridge by creating a test script:

```typescript
// test-bridge.ts
import Redis from "ioredis";

const publisher = new Redis("redis://localhost:6379");

// Publish a test event
publisher.publish("room:test:join", JSON.stringify({
    event: "player_joined",
    roomId: "test-room-123",
    playerId: "player-456",
    timestamp: new Date().toISOString()
}));

console.log("Test event published!");
publisher.quit();
```

Run with:
```bash
npx tsx test-bridge.ts
```

Check the server logs for:
```
[RedisSubscriber] Received message from room:test:join: ...
[RedisSubscriber] Writing to Nakama: ...
```
