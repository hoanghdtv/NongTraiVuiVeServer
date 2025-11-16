// src/models/ActionEnvelope.ts
// Action system types for Colyseus room message handling

/**
 * Context information for action validation and execution
 */
export interface ActionContext {
  /** Client session ID who initiated the action */
  clientId: string;
  /** User ID from authentication */
  userId: string;
  /** Timestamp when action was received */
  timestamp: number;
  /** Optional metadata for the action */
  metadata?: Record<string, any>;
}

/**
 * Validation result from system action validation
 */
export interface ActionValidation {
  /** Whether the action is valid */
  ok: boolean;
  /** Error message if validation failed */
  error?: string;
  /** Error code for client handling */
  code?: string;
}

/**
 * Result of applying an action to the game state
 */
export interface ActionResult<T = any> {
  /** Whether the action was successful */
  success: boolean;
  /** Result data from the action */
  data?: T;
  /** Error message if action failed */
  error?: string;
  /** State changes caused by this action */
  changes?: Record<string, any>;
}

/**
 * Envelope wrapper for all actions in the game
 * Contains the action type, payload, and execution context
 */
export interface ActionEnvelope<T = any> {
  /** Type of action (e.g., "place.building", "harvest.crop") */
  actionType: string;
  /** Action payload/parameters */
  payload: T;
  /** Execution context */
  ctx: ActionContext;
  /** Unique ID for this action (for deduplication) */
  actionId?: string;
  /** Priority for action processing (higher = first) */
  priority?: number;
}

// Specific action payload types

export interface PlaceBuildingPayload {
  defId: string;
  position: { x: number; y: number };
  rotation?: 0 | 90 | 180 | 270;
}

export interface RemoveBuildingPayload {
  buildingId: string;
}

export interface UpgradeBuildingPayload {
  buildingId: string;
}

export interface PlantCropPayload {
  cropDefId: string;
  position: { x: number; y: number };
}

export interface HarvestCropPayload {
  cropId: string;
}

export interface FeedAnimalPayload {
  animalId: string;
  foodItemId: string;
  amount: number;
}

export interface CollectProductPayload {
  animalId: string;
}

export interface SellItemPayload {
  itemId: string;
  quantity: number;
  price?: number;
}

export interface MoveInventoryPayload {
  fromInventoryId: string;
  toInventoryId: string;
  itemId: string;
  quantity: number;
}

// Type-safe action envelopes for specific actions
export type PlaceBuildingAction = ActionEnvelope<PlaceBuildingPayload>;
export type RemoveBuildingAction = ActionEnvelope<RemoveBuildingPayload>;
export type UpgradeBuildingAction = ActionEnvelope<UpgradeBuildingPayload>;
export type PlantCropAction = ActionEnvelope<PlantCropPayload>;
export type HarvestCropAction = ActionEnvelope<HarvestCropPayload>;
export type FeedAnimalAction = ActionEnvelope<FeedAnimalPayload>;
export type CollectProductAction = ActionEnvelope<CollectProductPayload>;
export type SellItemAction = ActionEnvelope<SellItemPayload>;
export type MoveInventoryAction = ActionEnvelope<MoveInventoryPayload>;

// Union type for all possible actions
export type GameAction = 
  | PlaceBuildingAction
  | RemoveBuildingAction 
  | UpgradeBuildingAction
  | PlantCropAction
  | HarvestCropAction
  | FeedAnimalAction
  | CollectProductAction
  | SellItemAction
  | MoveInventoryAction;

/**
 * Helper function to create action envelope
 */
export function createActionEnvelope<T>(
  actionType: string,
  payload: T,
  ctx: ActionContext,
  options?: {
    actionId?: string;
    priority?: number;
  }
): ActionEnvelope<T> {
  return {
    actionType,
    payload,
    ctx,
    actionId: options?.actionId || `${actionType}_${ctx.timestamp}_${Math.random().toString(36).substr(2, 9)}`,
    priority: options?.priority || 0
  };
}

/**
 * Helper function to create action context
 */
export function createActionContext(
  clientId: string,
  userId: string,
  metadata?: Record<string, any>
): ActionContext {
  return {
    clientId,
    userId,
    timestamp: Date.now(),
    metadata
  };
}