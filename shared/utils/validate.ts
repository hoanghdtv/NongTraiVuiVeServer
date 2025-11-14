import { GameConfig } from '../configs/game-configs';
import { FarmState } from '../schemas/farm-states';

export function validateConfigShape(cfg: GameConfig) {
  if (!cfg.config_version) throw new Error('missing config_version');
  if (!cfg.checksum) throw new Error('missing checksum');
  // minimal checks; expand with zod/io-ts if needed
  return true;
}

export function validateFarmShape(state: FarmState) {
  if (!state.farm_id) throw new Error('missing farm_id');
  if (typeof state.sequence !== 'number') throw new Error('missing sequence');
  return true;
}