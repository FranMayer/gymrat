/**
 * Entidad: Perfil de usuario.
 * Contiene datos personales y preferencias para el generador de rutinas.
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
  /** Fecha de última actualización (ISO string) */
  updatedAt: string;
}

/**
 * Calcula el IMC a partir de altura (m) y peso (kg).
 * IMC = peso / altura²
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}
