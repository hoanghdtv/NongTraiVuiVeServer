# NongTraiVuiVeServer Wiki

## 📖 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

**NongTraiVuiVeServer** is a real-time multiplayer game server built with:
- **Colyseus** - Real-time multiplayer framework
- **Nakama** - Game server with social features and storage
- **Redis** - Presence and pub/sub messaging
- **PostgreSQL** - Database for Nakama
- **TypeScript** - Type-safe development

### Key Features

- ✅ Real-time multiplayer rooms with Colyseus
- ✅ Custom Nakama JavaScript runtime modules
- ✅ Redis-based presence system
- ✅ Bridge client for Colyseus-Nakama communication
- ✅ Docker containerization
- ✅ TypeScript throughout

---

## Architecture

### System Architecture

```
┌─────────────────┐
│     Client      │
│   (Unity/Web)   │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌─────────────┐  ┌─────────────┐
│  Colyseus   │  │   Nakama    │
│   Server    │◄─┤   Server    │
│  (Port 2567)│  │ (Port 7350) │
└──────┬──────┘  └──────┬──────┘
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│    Redis    │  │ PostgreSQL  │
│ (Port 6379) │  │ (Port 5432) │
└─────────────┘  └─────────────┘
```

### Directory Structure

```
NongTraiVuiVeServer/
├── src/                          # Colyseus server source
│   ├── index.ts                 # Entry point
│   ├── app.config.ts            # Server configuration
│   ├── rooms/                   # Colyseus room handlers
│   │   ├── MyRoom.ts
│   │   ├── FarmRoom.ts
│   │   └── schema/
│   ├── models/                  # Data models
│   ├── systems/                 # Game systems
│   │   └── building/
│   ├── infrastructures/         # Infrastructure layer
│   │   └── bridge/              # Nakama bridge client
│   │       ├── BridgeClient.ts
│   │       ├── BridgeClientOptions.ts
│   │       └── RedisSubscriber.ts
│   └── bridge/                  # Redis-Nakama bridge
│       ├── redisSubscriber.ts
│       └── README.md
├── nakama/                      # Nakama runtime modules
│   ├── src/
│   │   └── main.ts             # Nakama JS module
│   ├── build/
│   │   └── index.js            # Compiled JS
│   ├── local.yml               # Nakama config
│   ├── Dockerfile
│   └── package.json
├── test/                        # Tests
├── build/                       # Compiled output
├── docker-compose.yml           # Docker orchestration
├── Dockerfile                   # Colyseus container
├── test-nakama.ts              # Nakama test script
├── NAKAMA_TESTING.md           # Nakama testing guide
├── INSTALLATION.md             # Installation guide
└── WIKI.md                     # This file
```

---

## Getting Started

### Prerequisites

- Node.js >= 20.9.0
- Docker Desktop
- npm or yarn

### Quick Setup

1. **Clone the repository**
```bash
git clone https://github.com/hoanghdtv/NongTraiVuiVeServer.git
cd NongTraiVuiVeServer
```

2. **Install dependencies**
```bash
npm install
```

3. **Start all services with Docker**
```bash
docker compose up -d --build
```

4. **Verify services**
```bash
# Check containers
docker compose ps

# Check Colyseus
curl http://localhost:2567/hello_world

# Check Nakama
curl http://localhost:7350/healthcheck

# Check Redis
redis-cli -h localhost -p 6379 ping
```

### Environment Variables

Create `.env.development`:
```bash
# Redis
REDIS_URL=redis://localhost:6379

# Nakama
NAKAMA_HOST=localhost
NAKAMA_PORT=7350
NAKAMA_SERVER_KEY=defaultkey

# Server
PORT=2567
NODE_ENV=development
```

---

## Development

### Running Locally (Without Docker)

1. **Start Redis**
```bash
docker run -d -p 6379:6379 redis:7
```

2. **Start Nakama**
```bash
cd nakama
docker compose up -d
cd ..
```

3. **Start Colyseus**
```bash
npm start
```

### Building

```bash
# Build Colyseus
npm run build

# Build Nakama modules
cd nakama
npm run build
cd ..
```

### Hot Reload

Colyseus uses `tsx watch` for hot reload:
```bash
npm start
```

For Nakama changes:
```bash
cd nakama
npm run watch  # Watch mode
cd ..
docker compose restart nakama
```

### Adding New Colyseus Rooms

1. Create room class in `src/rooms/`:
```typescript
// src/rooms/GameRoom.ts
import { Room, Client } from "@colyseus/core";
import { GameRoomState } from "./schema/GameRoomState";

export class GameRoom extends Room<GameRoomState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new GameRoomState());
    console.log("GameRoom created!", options);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
  }

  onDispose() {
    console.log("GameRoom disposing...");
  }
}
```

2. Register in `src/app.config.ts`:
```typescript
import { GameRoom } from "./rooms/GameRoom";

initializeGameServer: (gameServer) => {
  gameServer.define('game_room', GameRoom);
}
```

### Adding Nakama RPC Functions

1. Edit `nakama/src/main.ts`:
```typescript
let rpcCustomFunction: nkruntime.RpcFunction = function(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string
): string {
  logger.info('Custom RPC called');
  
  const data = JSON.parse(payload);
  // Your logic here
  
  return JSON.stringify({ success: true, data });
};

// Register in InitModule
initializer.registerRpc('custom_function', rpcCustomFunction);
```

2. Build and restart:
```bash
cd nakama
npm run build
cd ..
docker compose restart nakama
```

---

## Testing

### Testing Nakama Modules

See [NAKAMA_TESTING.md](./NAKAMA_TESTING.md) for detailed testing guide.

**Quick test:**
```bash
npx tsx test-nakama.ts
```

### Testing Colyseus Rooms

```bash
npm test
```

### Load Testing

```bash
npm run loadtest -- --room my_room --numClients 10
```

---

## Deployment

### Docker Production Build

1. **Update Dockerfile for production**
```dockerfile
ENV NODE_ENV production
```

2. **Build and deploy**
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### Environment Setup

Production `.env.production`:
```bash
REDIS_URL=redis://production-redis:6379
NAKAMA_HOST=production-nakama
NAKAMA_PORT=7350
NAKAMA_SERVER_KEY=your-secure-key
PORT=2567
NODE_ENV=production
```

---

## API Reference

### Colyseus Endpoints

- **WebSocket**: `ws://localhost:2567`
- **HTTP Health**: `GET http://localhost:2567/hello_world`
- **Monitor**: `http://localhost:2567/monitor` (dev only)
- **Playground**: `http://localhost:2567/` (dev only)

### Nakama Endpoints

- **HTTP API**: `http://localhost:7350`
- **gRPC API**: `localhost:7349`
- **Console**: `http://localhost:7351`
  - Username: `admin`
  - Password: `password`

### Available Nakama RPC Functions

#### 1. `hello` - Test RPC
```typescript
// Request
POST /v2/rpc/hello
{
  "test": "data",
  "timestamp": 1234567890
}

// Response
{
  "message": "Hello from Nakama!",
  "payload": { "test": "data" },
  "timestamp": 1234567890,
  "userId": "user-id"
}
```

#### 2. `get_user` - Get User Info
```typescript
// Request
POST /v2/rpc/get_user
{}

// Response
{
  "userId": "user-id",
  "username": "username",
  "displayName": "Display Name",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### 3. `write_data` - Write Storage
```typescript
// Request
POST /v2/rpc/write_data
{
  "key": "my_key",
  "value": "my_value",
  "nested": { "foo": "bar" }
}

// Response
{
  "success": true,
  "key": "my_key"
}
```

#### 4. `read_data` - Read Storage
```typescript
// Request
POST /v2/rpc/read_data
{
  "key": "my_key"
}

// Response
{
  "key": "my_key",
  "value": "my_value",
  "nested": { "foo": "bar" }
}
```

### Bridge Client API

```typescript
import { BridgeClient } from "./infrastructures/bridge/BridgeClient";

// Initialize
const bridge = new BridgeClient({
  host: "localhost",
  port: 7350,
  serverKey: "defaultkey",
  defaultTimeoutMs: 3000,
  maxRetries: 2
});

// Authenticate
await bridge.authenticateService("service-id");

// Call RPC
const result = await bridge.rpc("hello", { data: "test" });

// Read storage
const data = await bridge.getStorageObject("collection", "key", "userId");
```

---

## Troubleshooting

### Common Issues

#### 1. Docker containers not starting

**Problem**: `Cannot connect to Docker daemon`

**Solution**:
```bash
# Start Docker Desktop
open -a Docker

# Wait for it to start, then:
docker compose up -d
```

#### 2. Nakama module not loading

**Problem**: `Found runtime modules","count":0`

**Solution**:
```bash
# Rebuild Nakama module
cd nakama
npm run build
cd ..

# Rebuild container
docker compose down
docker compose up -d --build

# Check logs
docker compose logs nakama | grep "Registered RPC"
```

#### 3. Redis connection error

**Problem**: `ENOTFOUND redis`

**Solution**:
```bash
# Check Redis is running
docker compose ps | grep redis

# Restart Redis
docker compose restart redis

# Check network
docker network ls
```

#### 4. TypeScript compilation errors

**Problem**: Type errors in build

**Solution**:
```bash
# Clean and rebuild
npm run clean
npm run build

# For Nakama
cd nakama
rm -rf build node_modules
npm install
npm run build
```

#### 5. Port already in use

**Problem**: `EADDRINUSE: address already in use`

**Solution**:
```bash
# Find process using port
lsof -i :2567  # Colyseus
lsof -i :7350  # Nakama
lsof -i :6379  # Redis

# Kill process
kill -9 <PID>

# Or stop all containers
docker compose down
```

### Debug Commands

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f nakama
docker compose logs -f colyseus
docker compose logs -f redis

# Check container status
docker compose ps

# Enter container shell
docker compose exec nakama sh
docker compose exec colyseus sh

# Check network connectivity
docker compose exec colyseus ping nakama
docker compose exec colyseus ping redis

# Inspect container
docker compose exec nakama ls -la /nakama/data/modules/build/
```

### Performance Tips

1. **Use Redis for presence**
```typescript
// In app.config.ts
options: {
  presence: new RedisPresence(process.env.REDIS_URL)
}
```

2. **Enable compression**
```typescript
// In room
this.setPatchRate(50); // ms
this.setSimulationInterval((dt) => this.update(dt), 100);
```

3. **Optimize Docker**
```bash
# Prune unused resources
docker system prune -a

# Use production build
docker compose -f docker-compose.prod.yml up -d
```

---

## Resources

### Documentation Links

- [Colyseus Docs](https://docs.colyseus.io/)
- [Nakama Docs](https://heroiclabs.com/docs/)
- [Redis Docs](https://redis.io/docs/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

### Internal Documentation

- [Installation Guide](./INSTALLATION.md)
- [Nakama Testing Guide](./NAKAMA_TESTING.md)
- [Bridge README](./src/bridge/README.md)

### Support

- GitHub Issues: [NongTraiVuiVeServer/issues](https://github.com/hoanghdtv/NongTraiVuiVeServer/issues)
- Discord: [Contact team]

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Write tests for new features
- Document public APIs

---

## License

[Your License Here]

---

## Changelog

### v1.0.0 (Current)
- ✅ Initial release
- ✅ Colyseus multiplayer server
- ✅ Nakama integration with custom JS modules
- ✅ Redis presence system
- ✅ Bridge client for cross-service communication
- ✅ Docker containerization
- ✅ Comprehensive testing tools

---

**Last Updated**: November 14, 2025
