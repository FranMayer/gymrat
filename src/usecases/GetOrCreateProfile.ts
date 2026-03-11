import type { UserProfile } from '@/domain/entities';
import type { IUserProfileRepository } from '@/domain/repositories';

const DEFAULT_ID = 'default_profile';

export interface GetOrCreateProfileResult {
  profile: UserProfile;
  isNew: boolean;
}

export async function getOrCreateProfile(
  repo: IUserProfileRepository
): Promise<GetOrCreateProfileResult> {
  const existing = await repo.get();
  if (existing) return { profile: existing, isNew: false };
  const defaultProfile: UserProfile = {
    id: DEFAULT_ID,
    name: '',
    age: 25,
    sex: 'otro',
    heightCm: 170,
    weightKg: 70,
    objective: 'tonificar',
    level: 'principiante',
    updatedAt: new Date().toISOString(),
  };
  return { profile: defaultProfile, isNew: true };
}
