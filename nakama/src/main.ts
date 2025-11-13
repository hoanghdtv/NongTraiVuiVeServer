// RPC function to test from client
let rpcHello: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC Hello called with payload: ' + payload);
    
    const response = {
        message: "Hello from Nakama!",
        payload: payload,
        timestamp: Date.now(),
        userId: ctx.userId
    };
    
    return JSON.stringify(response);
};

// RPC to get user data
let rpcGetUser: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC GetUser called');
    
    const userId = ctx.userId || payload;
    const account = nk.accountGetId(userId);
    
    return JSON.stringify({
        userId: userId,
        username: account.user.username,
        displayName: account.user.displayName,
        createdAt: account.user.createTime
    });
};

// RPC to write storage
let rpcWriteData: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC WriteData called with payload: ' + payload);
    
    const data = JSON.parse(payload);
    
    const write: nkruntime.StorageWriteRequest[] = [{
        collection: 'test_collection',
        key: data.key || 'test_key',
        userId: ctx.userId,
        value: data,
        permissionRead: 2, // Public read
        permissionWrite: 1 // Owner write
    }];
    
    nk.storageWrite(write);
    
    return JSON.stringify({ success: true, key: data.key });
};

// RPC to read storage
let rpcReadData: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC ReadData called');
    
    const data = JSON.parse(payload);
    
    const read: nkruntime.StorageReadRequest[] = [{
        collection: 'test_collection',
        key: data.key || 'test_key',
        userId: ctx.userId || ''
    }];
    
    const objects = nk.storageRead(read);
    
    if (objects.length > 0) {
        return JSON.stringify(objects[0].value);
    }
    
    return JSON.stringify({ error: 'Data not found' });
};

let InitModule: nkruntime.InitModule =
    function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    logger.info("Nakama JS Module Initialized!");
    
    // Register RPC functions
    initializer.registerRpc('hello', rpcHello);
    initializer.registerRpc('get_user', rpcGetUser);
    initializer.registerRpc('write_data', rpcWriteData);
    initializer.registerRpc('read_data', rpcReadData);
    
    logger.info("Registered RPC functions: hello, get_user, write_data, read_data");
};
