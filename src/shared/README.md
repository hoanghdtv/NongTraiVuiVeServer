# Shared configs & schemas

Thư mục chứa **shared types và configs** dùng chung giữa **Nakama (Node/NakamaJS)** và **Colyseus (Node)**.

**Mục tiêu:**

* Định nghĩa types/schema dùng chung (TypeScript) cho `GameConfig` và `FarmState`.
* Export helper để validate/checksum/config_version.
* Skeleton migration registry cho module-level migrations.
* Auto-sync workflow cho Nakama runtime.
* Type safety cho cả Colyseus và Nakama.

---

## 🏗️ Cấu trúc thư mục

```
/shared
  /configs
    game-configs.ts            # GameConfig types + example defs + checksum util
    index.ts                   # exports
  /schemas
    farm-states.ts             # FarmState types, ModuleState
    migrations.ts              # migration registry + runner
    index.ts                   # exports
  /utils
    validate.ts                # validation helpers (config/schema checks)
  README.md                   # hướng dẫn này
```

## 🔄 Workflow sử dụng

### 1. **Trong Colyseus** (Direct import)
```typescript
// Import trực tiếp từ shared
import { GameConfig, FarmState } from '../shared';
import { BuildingDef, CropDef } from '../shared/configs/game-configs';

// Sử dụng trong Room
export class FarmRoom extends Room {
  private gameConfig: GameConfig;
  private farmState: FarmState;
  // ...
}
```

### 2. **Trong Nakama** (Auto-sync)
```typescript
// Nakama sử dụng auto-generated file
/// <reference path="./shared-types.ts" />

// Các types tự động có sẵn: GameConfig, FarmState, etc.
let rpcGetConfig: nkruntime.RpcFunction = function(ctx, logger, nk, payload) {
  const config = exampleConfig;
  const configWithChecksum = buildConfigWithChecksum(config);
  return JSON.stringify(configWithChecksum);
};
```

## 🛠️ Sync Workflow

Do Nakama runtime không thể import trực tiếp từ thư mục bên ngoài, chúng ta sử dụng **auto-sync script**:

### Cách thức hoạt động:
1. **Edit shared types** trong `shared/configs/` hoặc `shared/schemas/`
2. **Run sync script** để copy types vào Nakama
3. **Build Nakama** với types mới

### Commands:
```bash
# Sync shared types to Nakama
npm run sync-shared

# Build Nakama với auto-sync
npm run build-nakama

# Hoặc từ nakama directory
cd nakama
npm run sync-shared
npm run build-with-sync
```

### File được tạo:
- `nakama/src/shared-types.ts` - Auto-generated từ shared types
- Không được edit manual, sẽ bị overwrite

## 📋 Type Definitions

### GameConfig
```typescript
interface GameConfig {
  config_version: string;    // Version tracking
  checksum: string;          // Data integrity
  building_defs: Record<ID, BuildingDef>;
  crop_defs: Record<ID, CropDef>;
}
```

### FarmState  
```typescript
interface FarmState {
  farm_id: string;
  owner_user_id?: string;
  schema_version: string;
  sequence: number;          // Optimistic locking
  last_updated?: string;
  modules: Record<string, ModuleState>;
}
```

## 🚀 Recommended Workflow

### Development:
1. **Author config** trong `shared/configs/game-configs.ts`
2. **Run sync** để update Nakama: `npm run sync-shared`
3. **Build & test** cả Colyseus và Nakama
4. **Commit** cả shared changes và generated files

### Production:
1. Author config → build checksum → publish to Nakama storage
2. Nakama emits `config:updated` event (Redis hoặc Nakama realtime)  
3. Colyseus instances subscribe và hot-reload cached config
4. Client receives config updates via room broadcasts

## ✅ Lợi ích

- **🔒 Type Safety**: TypeScript checking cho cả 2 systems
- **📍 Single Source of Truth**: Định nghĩa một lần, dùng mọi nơi
- **🔄 Auto-sync**: Script tự động đồng bộ types
- **🚫 No Runtime Dependencies**: Nakama không cần external imports
- **🔍 Version Control**: Track changes qua Git
- **⚡ Hot Reload**: Config updates không cần restart

## ⚠️ Lưu ý quan trọng

- **Không edit** `nakama/src/shared-types.ts` trực tiếp
- **Luôn sync** sau khi thay đổi shared types
- **Test build** sau mỗi lần sync
- **Commit generated files** để team sync
- **Version configs** để rollback dễ dàng

---
