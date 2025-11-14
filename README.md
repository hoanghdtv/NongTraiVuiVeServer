# NongTraiVuiVe Game Server

Farm game server sử dụng **Colyseus** (realtime multiplayer) và **Nakama** (backend services) với shared TypeScript types.

## 🎮 Tech Stack

- **Colyseus**: Realtime game rooms, multiplayer logic
- **Nakama**: User management, persistence, RPC functions  
- **Redis**: Presence, caching
- **PostgreSQL**: Database storage
- **Docker**: Container orchestration
- **TypeScript**: Shared types và type safety

## 🚀 Quick Start

### 1. Khởi động services
```bash
# Start Docker services (PostgreSQL, Nakama, Redis)
docker-compose up -d

# Start Colyseus server
npm start
```

### 2. Development workflow
```bash
# Install dependencies
npm install

# Start development server (with hot reload)
npm start

# Run tests
npm test

# Load testing
npm run loadtest
```

## 📁 Project Structure

```
├── src/                          # Colyseus server source
│   ├── rooms/                    # Game rooms (FarmRoom, etc.)
│   ├── systems/                  # Game systems (building, crops)
│   ├── repositories/             # Data access layer
│   └── infrastructures/          # External integrations
├── nakama/                       # Nakama server module
│   ├── src/main.ts              # Nakama RPC functions
│   └── src/shared-types.ts      # Auto-generated shared types
├── shared/                       # Shared TypeScript definitions
│   ├── configs/                 # Game configurations
│   └── schemas/                 # Data schemas
├── scripts/                      # Build & utility scripts
│   └── sync-shared.js           # Sync shared types to Nakama
└── docker-compose.yml           # Container orchestration
```

## 🔄 Shared Types Workflow

Do Nakama runtime restrictions, chúng ta sử dụng auto-sync workflow:

### Commands:
```bash
# Sync shared types to Nakama
npm run sync-shared

# Build Nakama với auto-sync  
npm run build-nakama

# Sync + build + start all
npm run dev
```

### Workflow:
1. Edit shared types trong `shared/configs/` hoặc `shared/schemas/`
2. Run `npm run sync-shared` để copy sang Nakama
3. Build và test cả Colyseus và Nakama

📖 **Xem chi tiết**: [SHARED_WORKFLOW.md](./SHARED_WORKFLOW.md)

## 🏗️ Architecture

### Game Flow:
```
Client ↔ Colyseus (Realtime) ↔ Nakama (Persistence)
                                     ↕
                               PostgreSQL Storage
```

### Key Components:

#### **Colyseus Rooms:**
- `FarmRoom`: Farm management, realtime updates
- `BuildingRoom`: Building placement & upgrades
- State sync và multiplayer interactions

#### **Nakama RPCs:**
- `get_config`: Game configuration
- `get_farm` / `update_farm`: Farm state persistence  
- `user.*`: User management
- Custom game logic functions

#### **Shared Systems:**
- `GridService`: Building placement logic
- `BuildingSystem`: Building management
- Repository pattern cho data access

## 🎯 Game Features

- **🏡 Farm Management**: Crop planting, building placement
- **👥 Multiplayer**: Realtime farm visits, social features
- **💰 Economy**: Resource management, trading
- **🔧 Building System**: Grid-based placement với collision detection
- **📊 Persistence**: User progress, farm state, configurations

## 🛠️ Development Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Colyseus dev server |
| `npm test` | Run test suite |
| `npm run build` | Build production |
| `npm run loadtest` | Performance testing |
| `npm run sync-shared` | Sync shared types |
| `npm run build-nakama` | Build Nakama module |

## 🐳 Docker Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services  
docker-compose down
```

**Services:**
- **PostgreSQL** (port 5432): Database
- **Nakama** (port 7350): Backend API  
- **Redis** (port 6379): Cache & presence
- **Colyseus** (port 2567): Game server

## 📊 Monitoring

- **Colyseus Monitor**: http://localhost:2567/monitor
- **Colyseus Playground**: http://localhost:2567/
- **Nakama Console**: http://localhost:7351

## 🧪 Testing

```bash
# Run all tests
npm test

# Test specific room
npm run test -- --grep "FarmRoom"

# Load testing
npm run loadtest
```

## 📝 Configuration

### Environment Variables:
```env
PORT=2567
REDIS_URL=redis://localhost:6379
NAKAMA_HOST=localhost
NAKAMA_PORT=7350
NAKAMA_SERVER_KEY=defaultkey
NODE_ENV=development
```

### Game Config:
- Shared configs trong `shared/configs/game-configs.ts`
- Auto-sync sang Nakama qua script
- Hot-reload support cho development

## 🚀 Production Deployment

1. **Build production**:
```bash
npm run build
npm run build-nakama
```

2. **Docker production**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

3. **Environment setup**:
- Set production environment variables
- Configure database connections
- Setup monitoring & logging

## 📖 Documentation

- [Colyseus Docs](http://docs.colyseus.io/)
- [Nakama Docs](https://heroiclabs.com/docs/)
- [Shared Types Workflow](./SHARED_WORKFLOW.md)
- [Architecture Guide](./docs/ARCHITECTURE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

**Note**: Luôn chạy `npm run sync-shared` sau khi thay đổi shared types!

## 📄 License

MIT License - xem [LICENSE](./LICENSE) file cho chi tiết.
