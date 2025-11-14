export type FarmState = {
  userId: string;
  version: number;
  timestamp: number;
  systems: {
    buildings?: any;
    crops?: any;
    animals?: any;
    inventory?: any;
    economy?: any;
  };
  // optionally actionLog / pendingActions
}
