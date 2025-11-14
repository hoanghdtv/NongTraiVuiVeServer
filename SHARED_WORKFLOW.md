# Shared Types Workflow

## 🎯 Vấn đề
Nakama runtime không thể import trực tiếp từ thư mục `../shared` do môi trường runtime riêng biệt.

## 🛠️ Giải pháp
Chúng ta sử dụng script tự động sync để copy types từ `shared/` vào Nakama.

## 📁 Cấu trúc
```
shared/
├── configs/game-configs.ts    # Game config types
└── schemas/farm-states.ts     # Farm state schemas

nakama/src/
├── main.ts                    # Main Nakama code
└── shared-types.ts           # Auto-generated từ shared/ 

scripts/
└── sync-shared.js            # Script sync types
```

## 🚀 Workflow

### 1. Cập nhật shared types
Edit files trong `shared/configs/` hoặc `shared/schemas/`

### 2. Sync sang Nakama
```bash
# Từ root directory
npm run sync-shared

# Hoặc từ nakama directory  
npm run sync-shared
```

### 3. Build Nakama
```bash
# Build với sync tự động
npm run build-nakama

# Hoặc manual
cd nakama
npm run build-with-sync
```

## 📋 Commands

| Command | Description |
|---------|-------------|
| `npm run sync-shared` | Sync shared types to Nakama |
| `npm run build-nakama` | Sync + build Nakama |
| `cd nakama && npm run build-with-sync` | Build Nakama với sync |

## 🔄 Auto-sync trong Development

Có thể setup file watcher để auto-sync khi shared files thay đổi:

```bash
# Install nodemon globally
npm install -g nodemon

# Watch shared directory
nodemon --watch shared --ext ts --exec "npm run sync-shared"
```

## ✅ Lợi ích

1. **Single Source of Truth**: Shared types được định nghĩa một lần
2. **Type Safety**: TypeScript checking cho cả Colyseus và Nakama  
3. **Auto-sync**: Script tự động đồng bộ
4. **No Runtime Dependencies**: Nakama không cần external imports

## ⚠️ Lưu ý

- **Không edit** `nakama/src/shared-types.ts` trực tiếp
- Luôn chạy `sync-shared` sau khi thay đổi shared types
- Kiểm tra build success sau khi sync