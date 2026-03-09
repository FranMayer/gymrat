import type { StreakState } from '@/domain/entities';
import type { IStreakRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

export class LocalStorageStreakRepository implements IStreakRepository {
  async get(): Promise<StreakState | null> {
    const raw = localStorage.getItem(STORAGE_KEYS.streakState);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StreakState;
    } catch {
      return null;
    }
  }

  async save(state: StreakState): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.streakState, JSON.stringify(state));
  }
}

