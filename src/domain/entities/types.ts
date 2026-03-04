/**
 * Tipos y enums del dominio.
 * Centraliza objetivos, niveles y cualquier valor fijo usado en la app.
 */

/** Objetivo fitness del usuario */
export type Objective = 'tonificar' | 'adelgazar' | 'ganar_masa';

/** Nivel de experiencia */
export type Level = 'principiante' | 'intermedio' | 'avanzado';

/** Sexo para cálculo de métricas (opcional) */
export type Sex = 'hombre' | 'mujer' | 'otro';
