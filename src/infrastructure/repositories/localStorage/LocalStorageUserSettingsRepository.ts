import type { UserSettings } from '@/domain/entities';
import type { IUserSettingsRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

export class LocalStorageUserSettingsRepository implements IUserSettingsRepository {
  async get(): Promise<UserSettings | null> {
    const raw = localStorage.getItem(STORAGE_KEYS.userSettings);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSettings;
    } catch {
      return null;
    }
  }

  async save(settings: UserSettings): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.userSettings, JSON.stringify(settings));
  }
}

