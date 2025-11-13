# Testing Nakama JS Modules

## Quick Start

### 1. Rebuild và chạy Nakama với module mới

```bash
# Build lại để compile TypeScript module
cd nakama
npm run build

# Quay lại thư mục root
cd ..

# Restart Docker containers
docker compose down
docker compose up -d --build
```

### 2. Kiểm tra module đã load

```bash
# Xem logs của Nakama
docker compose logs nakama | grep "Registered RPC"
```

Bạn sẽ thấy:
```
Nakama JS Module Initialized!
Registered RPC functions: hello, get_user, write_data, read_data
```

### 3. Chạy test script

```bash
npx tsx test-nakama.ts
```

## Test Methods

### Method 1: Dùng Test Script (Recommended)

```bash
npx tsx test-nakama.ts
```

Output mong đợi:
```
🧪 Testing Nakama JS Modules...

✅ Client created

1️⃣ Authenticating...
✅ Authenticated: { userId: '...', username: '...' }

2️⃣ Testing RPC: hello
✅ RPC hello result: { message: 'Hello from Nakama!', ... }

3️⃣ Testing RPC: get_user
✅ RPC get_user result: { userId: '...', username: '...' }

4️⃣ Testing RPC: write_data
✅ RPC write_data result: { success: true, key: '...' }

5️⃣ Testing RPC: read_data
✅ RPC read_data result: { key: '...', value: '...' }

🎉 All tests passed!
```

### Method 2: Dùng curl (HTTP API)

```bash
# 1. Authenticate và lấy token
curl -X POST http://localhost:7350/v2/account/authenticate/device \
  -H 'Content-Type: application/json' \
  -d '{"id":"test-device-123"}' \
  --user "defaultkey:"

# Response sẽ có "token": "..."
# Copy token và dùng cho các request tiếp theo

# 2. Call RPC hello
curl -X POST http://localhost:7350/v2/rpc/hello \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{"test":"data"}'

# 3. Call RPC write_data
curl -X POST http://localhost:7350/v2/rpc/write_data \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{"key":"my_key","value":"my_value"}'

# 4. Call RPC read_data
curl -X POST http://localhost:7350/v2/rpc/read_data \
  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \
  -H 'Content-Type: application/json' \
  -d '{"key":"my_key"}'
```

### Method 3: Dùng Nakama Console

1. Mở browser: http://localhost:7351
2. Login với:
   - Username: `admin`
   - Password: `password`
3. Vào **API Explorer**
4. Chọn endpoint `/v2/rpc/{id}`
5. Nhập RPC ID: `hello`, `get_user`, `write_data`, hoặc `read_data`
6. Nhập payload JSON và test

### Method 4: Dùng grpcurl (gRPC)

```bash
# Install grpcurl nếu chưa có
brew install grpcurl

# List available services
grpcurl -plaintext localhost:7349 list

# Call RPC
grpcurl -plaintext \
  -d '{"id":"hello","payload":"{\"test\":\"data\"}"}' \
  localhost:7349 nakama.api.Nakama/RpcFunc
```

## Available RPC Functions

### 1. `hello` - Test RPC
```typescript
// Request
{ test: "data", timestamp: 1234567890 }

// Response
{
  message: "Hello from Nakama!",
  payload: { test: "data", ... },
  timestamp: 1234567890,
  userId: "user-id"
}
```

### 2. `get_user` - Get user info
```typescript
// Request
{}

// Response
{
  userId: "user-id",
  username: "username",
  displayName: "Display Name",
  createdAt: "2023-01-01T00:00:00Z"
}
```

### 3. `write_data` - Write to storage
```typescript
// Request
{
  key: "my_key",
  value: "my_value",
  nested: { foo: "bar" }
}

// Response
{ success: true, key: "my_key" }
```

### 4. `read_data` - Read from storage
```typescript
// Request
{ key: "my_key" }

// Response
{
  key: "my_key",
  value: "my_value",
  nested: { foo: "bar" }
}
```

## Debugging

### View Nakama logs
```bash
docker compose logs -f nakama
```

### Check if module loaded
```bash
docker compose logs nakama | grep "JavaScript runtime modules loaded"
```

### Rebuild module after changes
```bash
cd nakama
npm run build
cd ..
docker compose restart nakama
```

### Check RPC registration
```bash
docker compose logs nakama | grep "Registered RPC"
```

## Integration với Colyseus

Từ Colyseus room, bạn có thể gọi Nakama RPC:

```typescript
import { BridgeClient } from "./infrastructures/bridge/BridgeClient";

const bridge = new BridgeClient({
  host: "localhost",
  port: 7350,
  serverKey: "defaultkey"
});

await bridge.authenticateService();

// Call RPC
const result = await bridge.rpc("hello", { test: "from colyseus" });
console.log(result);
```

## Troubleshooting

**Module không load:**
- Check `docker compose logs nakama` có "JavaScript runtime modules loaded"
- Verify file `build/main.js` tồn tại trong container: `docker compose exec nakama ls /nakama/data/modules/build/`

**RPC not found:**
- Check logs có "Registered RPC functions"
- Verify tên RPC chính xác (case-sensitive)

**Permission denied:**
- Check Nakama config `local.yml`
- Verify server key đúng

**TypeScript compile error:**
- Run `cd nakama && npm run build` để xem lỗi chi tiết
