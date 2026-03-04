/**
 * Caso de uso: guardar (o actualizar) el perfil de usuario.
 */

import type { UserProfile } from '@/domain/entities';
import type { IUserProfileRepository } from '@/domain/repositories';

export async function saveProfile(repo: IUserProfileRepository, profile: UserProfile): Promise<void> {
  const toSave: UserProfile = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await repo.save(toSave);
}
