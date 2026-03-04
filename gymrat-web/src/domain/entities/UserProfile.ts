/**
 * Entidad: Perfil de usuario.
 */

import type { Objective, Level, Sex } from './types';

export interface UserProfile {
  id: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  objective: Objective;
  level: Level;
  updatedAt: string;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
