import type { UserProfile } from '@/domain/entities';
import type { IUserProfileRepository } from '@/domain/repositories';
import { STORAGE_KEYS } from './storageKeys';

export class LocalStorageUserProfileRepository implements IUserProfileRepository {
  async get(): Promise<UserProfile | null> {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }

  async save(profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(profile));
  }

  async delete(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.user);
  }
}
