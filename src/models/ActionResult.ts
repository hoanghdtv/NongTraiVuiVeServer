// src/models/ActionResult.ts

export type ActionResult = {
  ok: boolean;

  // error info
  error?: string;             
  errorCode?: string;         // ví dụ: "NOT_ENOUGH_COIN", "OUT_OF_RANGE"

  // state mutation (để FarmRoom tăng version + broadcast)
  stateDelta?: {
    buildings?: any;
    crops?: any;
    animals?: any;
    inventory?: any;
    economy?: any;
    [key: string]: any;
  };

  // events để client sync UI
  events?: Array<{
    type: string;
    data?: any;
  }>;

  // debug/tracking
  meta?: {
    actionCost?: any;         // cost đã trừ
    serverTime?: number;      // timestamp từ server
    [key: string]: any;
  };
};
