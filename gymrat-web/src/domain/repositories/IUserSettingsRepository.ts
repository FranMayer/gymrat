import type { UserSettings } from '../entities';

export interface IUserSettingsRepository {
  get(): Promise<UserSettings | null>;
  save(settings: UserSettings): Promise<void>;
}

