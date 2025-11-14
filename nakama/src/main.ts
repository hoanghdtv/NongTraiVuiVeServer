/// <reference path="./shared-types.ts" />

// RPC function to get game config
let rpcGetConfig: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC GetConfig called');
    
    try {
        // Get the current game config (you can store this in storage or hardcode for now)
        const config = exampleConfig;
        const configWithChecksum = buildConfigWithChecksum(config);
        
        return JSON.stringify({
            success: true,
            config: configWithChecksum
        });
    } catch (error) {
        logger.error('Error getting config: ' + error);
        return JSON.stringify({ 
            success: false, 
            error: 'Failed to get config' 
        });
    }
};

// RPC function to get farm state
let rpcGetFarm: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC GetFarm called for user: ' + ctx.userId);
    
    try {
        const userId = ctx.userId;
        if (!userId) {
            return JSON.stringify({ 
                success: false, 
                error: 'User not authenticated' 
            });
        }

        // Try to read existing farm state
        const read: nkruntime.StorageReadRequest[] = [{
            collection: 'farm_state',
            key: 'main_farm',
            userId: userId
        }];
        
        const objects = nk.storageRead(read);
        let farmState: FarmState;
        
        if (objects.length > 0) {
            farmState = objects[0].value as FarmState;
        } else {
            // Create new farm state
            farmState = {
                farm_id: 'farm:' + userId,
                owner_user_id: userId,
                schema_version: '1.0.0',
                sequence: 0,
                last_updated: new Date().toISOString(),
                modules: {
                    crop: { 
                        version: '1.0.0', 
                        data: { 
                            plots: [], 
                            seed_inventory: { wheat: 10 } 
                        } 
                    },
                    building: {
                        version: '1.0.0',
                        data: {
                            buildings: [],
                            resources: { gold: 1000, wood: 100 }
                        }
                    }
                }
            };
            
            // Save new farm state
            const write: nkruntime.StorageWriteRequest[] = [{
                collection: 'farm_state',
                key: 'main_farm',
                userId: userId,
                value: farmState,
                permissionRead: 1, // Owner read only
                permissionWrite: 1 // Owner write only
            }];
            
            nk.storageWrite(write);
        }
        
        return JSON.stringify({
            success: true,
            farmState: farmState
        });
    } catch (error) {
        logger.error('Error getting farm: ' + error);
        return JSON.stringify({ 
            success: false, 
            error: 'Failed to get farm state' 
        });
    }
};

// RPC function to update farm state
let rpcUpdateFarm: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC UpdateFarm called');
    
    try {
        const userId = ctx.userId;
        if (!userId) {
            return JSON.stringify({ 
                success: false, 
                error: 'User not authenticated' 
            });
        }

        const updateData = JSON.parse(payload);
        const { farmState, operation } = updateData;
        
        if (!farmState || !operation) {
            return JSON.stringify({ 
                success: false, 
                error: 'Invalid payload: farmState and operation required' 
            });
        }

        // Validate that the farm belongs to the user
        if (farmState.owner_user_id !== userId) {
            return JSON.stringify({ 
                success: false, 
                error: 'Unauthorized: farm does not belong to user' 
            });
        }

        // Update sequence for optimistic locking
        farmState.sequence += 1;
        farmState.last_updated = new Date().toISOString();
        
        // Save updated farm state
        const write: nkruntime.StorageWriteRequest[] = [{
            collection: 'farm_state',
            key: 'main_farm',
            userId: userId,
            value: farmState,
            permissionRead: 1,
            permissionWrite: 1
        }];
        
        nk.storageWrite(write);
        
        return JSON.stringify({
            success: true,
            farmState: farmState,
            operation: operation
        });
    } catch (error) {
        logger.error('Error updating farm: ' + error);
        return JSON.stringify({ 
            success: false, 
            error: 'Failed to update farm state' 
        });
    }
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

let InitModule: nkruntime.InitModule =
    function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    logger.info("Nakama JS Module Initialized!");
    
    // Register RPC functions
    initializer.registerRpc('hello', rpcHello);
    initializer.registerRpc('get_user', rpcGetUser);
    initializer.registerRpc('write_data', rpcWriteData);
    initializer.registerRpc('read_data', rpcReadData);
    
    // Register new farm-related RPC functions
    initializer.registerRpc('get_config', rpcGetConfig);
    initializer.registerRpc('get_farm', rpcGetFarm);
    initializer.registerRpc('update_farm', rpcUpdateFarm);
    
    logger.info("Registered RPC functions: hello, get_user, write_data, read_data, get_config, get_farm, update_farm");
};
