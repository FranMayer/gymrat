/**
 * Catálogo estático de ejercicios por grupo muscular.
 * Pensado para ampliación: se puede mover a SQLite o a un JSON externo.
 */

export interface CatalogExercise {
  id: string;
  name: string;
  muscleGroup: string;
}

/** Ejercicios básicos por grupo (id, nombre, grupo) */
export const EXERCISE_CATALOG: CatalogExercise[] = [
  { id: 'bench_press', name: 'Press banca', muscleGroup: 'pectorales' },
  { id: 'incline_dumbbell', name: 'Press inclinado con mancuernas', muscleGroup: 'pectorales' },
  { id: 'push_ups', name: 'Flexiones', muscleGroup: 'pectorales' },
  { id: 'squat', name: 'Sentadilla', muscleGroup: 'piernas' },
  { id: 'leg_press', name: 'Prensa de piernas', muscleGroup: 'piernas' },
  { id: 'lunges', name: 'Zancadas', muscleGroup: 'piernas' },
  { id: 'deadlift', name: 'Peso muerto', muscleGroup: 'espalda' },
  { id: 'barbell_row', name: 'Remo con barra', muscleGroup: 'espalda' },
  { id: 'lat_pulldown', name: 'Jalón al pecho', muscleGroup: 'espalda' },
  { id: 'overhead_press', name: 'Press militar', muscleGroup: 'hombros' },
  { id: 'lateral_raise', name: 'Elevaciones laterales', muscleGroup: 'hombros' },
  { id: 'barbell_curl', name: 'Curl con barra', muscleGroup: 'bíceps' },
  { id: 'tricep_pushdown', name: 'Extensiones de tríceps', muscleGroup: 'tríceps' },
  { id: 'plank', name: 'Plancha', muscleGroup: 'core' },
  { id: 'crunch', name: 'Abdominales', muscleGroup: 'core' },
];
