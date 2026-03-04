/**
 * Caso de uso: obtener el perfil de usuario o devolver uno por defecto (no persistido).
 * La UI puede usar el resultado para mostrar/editar y luego guardar.
 */

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
