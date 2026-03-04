import type { UserProfile } from '../entities';

export interface IUserProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(): Promise<void>;
}
