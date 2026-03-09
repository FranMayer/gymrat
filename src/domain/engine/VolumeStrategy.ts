/**
 * Estrategia de volumen: series y repeticiones según objetivo y nivel.
 */

import type { Objective, Level } from '../entities';

export interface VolumeResult {
  sets: number;
  reps: number;
}

export interface IVolumeStrategy {
  getVolume(objective: Objective, level: Level): VolumeResult;
}

/**
 * Tabla objetivo × nivel → sets y reps.
 * ganar_masa: 4-5 series, 6-8 reps.
 * tonificar: 3-4 series, 10-12 reps.
 * adelgazar: 3 series, 12-15 reps.
 */
const VOLUME_TABLE: Record<Objective, Record<Level, VolumeResult>> = {
  ganar_masa: {
    principiante: { sets: 4, reps: 8 },
    intermedio: { sets: 4, reps: 7 },
    avanzado: { sets: 5, reps: 6 },
  },
  tonificar: {
    principiante: { sets: 3, reps: 12 },
    intermedio: { sets: 4, reps: 11 },
    avanzado: { sets: 4, reps: 10 },
  },
  adelgazar: {
    principiante: { sets: 3, reps: 15 },
    intermedio: { sets: 3, reps: 14 },
    avanzado: { sets: 3, reps: 12 },
  },
};

export class DefaultVolumeStrategy implements IVolumeStrategy {
  getVolume(objective: Objective, level: Level): VolumeResult {
    return VOLUME_TABLE[objective]?.[level] ?? { sets: 3, reps: 10 };
  }
}
