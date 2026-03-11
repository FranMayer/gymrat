/**
 * Entidad: Perfil de usuario.
 */

import type { Objective, Level, Sex } from './types';

export interface UserProfile {
  id: string;
  /** Nombre opcional del usuario para saludos personalizados. */
  name?: string;
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

export function formatObjective(objective: Objective): string {
  switch (objective) {
    case 'ganar_masa':
      return 'Ganar masa';
    case 'adelgazar':
      return 'Perder peso';
    case 'tonificar':
    default:
      return 'Tonificar';
  }
}

export function formatLevel(level: Level): string {
  switch (level) {
    case 'principiante':
      return 'Principiante';
    case 'intermedio':
      return 'Intermedio';
    case 'avanzado':
      return 'Avanzado';
    default:
      return level;
  }
}

export function formatSex(sex: Sex): string {
  switch (sex) {
    case 'hombre':
      return 'Hombre';
    case 'mujer':
      return 'Mujer';
    case 'otro':
      return 'Prefiero no decir';
    default:
      return sex;
  }
}
