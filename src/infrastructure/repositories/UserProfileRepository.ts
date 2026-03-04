/**
 * Implementación SQLite del repositorio de perfil de usuario.
 */

import { getDatabase } from '../database/database';
import type { UserProfile } from '@/domain/entities';
import type { IUserProfileRepository } from '@/domain/repositories';

const TABLE = 'user_profile';

export class UserProfileRepository implements IUserProfileRepository {
  async get(): Promise<UserProfile | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      id: string;
      age: number;
      sex: string;
      height_cm: number;
      weight_kg: number;
      objective: string;
      level: string;
      updated_at: string;
    }>(`SELECT * FROM ${TABLE} LIMIT 1`);
    if (!row) return null;
    return rowToProfile(row);
  }

  async save(profile: UserProfile): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO ${TABLE} (id, age, sex, height_cm, weight_kg, objective, level, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profile.id,
        profile.age,
        profile.sex,
        profile.heightCm,
        profile.weightKg,
        profile.objective,
        profile.level,
        profile.updatedAt,
      ]
    );
  }

  async delete(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`DELETE FROM ${TABLE}`);
  }
}

function rowToProfile(row: {
  id: string;
  age: number;
  sex: string;
  height_cm: number;
  weight_kg: number;
  objective: string;
  level: string;
  updated_at: string;
}): UserProfile {
  return {
    id: row.id,
    age: row.age,
    sex: row.sex as UserProfile['sex'],
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    objective: row.objective as UserProfile['objective'],
    level: row.level as UserProfile['level'],
    updatedAt: row.updated_at,
  };
}
