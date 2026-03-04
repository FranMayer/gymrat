/**
 * Puerto: contrato para persistencia del perfil de usuario.
 * La capa de aplicación usa esta interfaz; la infraestructura la implementa.
 */

import type { UserProfile } from '../entities';

export interface IUserProfileRepository {
  get(): Promise<UserProfile | null>;
  save(profile: UserProfile): Promise<void>;
  delete(): Promise<void>;
}
