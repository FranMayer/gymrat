import type { StreakState } from '../entities';

export interface IStreakRepository {
  get(): Promise<StreakState | null>;
  save(state: StreakState): Promise<void>;
}

