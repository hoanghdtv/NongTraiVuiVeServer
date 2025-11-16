/// <reference types="nakama-runtime" />

import e from "express";
import { exampleConfig, exampleFarmState, FarmState } from "./shared";

// import { exampleConfig } from "./shared";

let rpcGetConfig: nkruntime.RpcFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
    logger.info('RPC GetConfig called');
    
    try {
        // Get the current game config
        // const config = exampleConfig;
        // const configWithChecksum = buildConfigWithChecksum(config);
        
        return JSON.stringify({
            success: true,
            config: exampleConfig
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
            farmState = createExampleFarmState(userId);
            
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
        if (!farmState.players[userId]) {
            return JSON.stringify({ 
                success: false, 
                error: 'Unauthorized: farm does not belong to user' 
            });
        }

        // Update tick and timestamp
        farmState.tick += 1;
        farmState.timeLastSaved = Date.now();
        
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
   
    let userId: string =  ctx.userId || '';
    try{
        if(payload && payload.length > 0){
            const data = JSON.parse(payload);
            if(data.id){
                userId = data.id;
            }
        }
    }
    catch(err){
        logger.error('Error parsing payload in rpcGetUser: ' + err);
    }

     logger.info('RPC GetUser called : ' + userId);

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
    initializer.registerRpc('user.get', rpcGetUser);
    initializer.registerRpc('user.save', rpcWriteData);
    initializer.registerRpc('user.read', rpcReadData);
    
    // Register new farm-related RPC functions
    initializer.registerRpc('farm.get-config', rpcGetConfig);
    initializer.registerRpc('farm.get', rpcGetFarm);
    initializer.registerRpc('farm.update', rpcUpdateFarm);
    
    logger.info("Registered RPC functions: hello, user.get, user.save, user.read, farm.get-config, farm.get, farm.update");
};

// // Export for Nakama runtime - Nakama looks for InitModule function in global scope
// const InitModule: nkruntime.InitModule = initializeNakama;

// Ensure InitModule is available in multiple ways
function exposeInitModule() {
    // Export directly without module wrapper for Nakama runtime
    // if (typeof exports !== 'undefined') {
    //     exports.InitModule = InitModule;
    //     exports.rpcHello = rpcHello;
    // }

    // Also make available in global scope as fallback
    if (typeof globalThis !== 'undefined') {
        (globalThis as any).InitModule = InitModule;
        (globalThis as any).rpcGetConfig = rpcGetConfig;
        (globalThis as any).rpcHello = rpcHello;
        (globalThis as any).rpcGetUser = rpcGetUser;
        (globalThis as any).rpcWriteData = rpcWriteData;
        (globalThis as any).rpcReadData = rpcReadData;
        (globalThis as any).rpcGetFarm = rpcGetFarm;
        (globalThis as any).rpcUpdateFarm = rpcUpdateFarm;
        
    }
}

// // Call expose function immediately
exposeInitModule();
function createExampleFarmState(userId: string): FarmState {
    return exampleFarmState;
}

