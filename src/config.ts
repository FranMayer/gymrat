/**
 * Configuración global de la app.
 * IS_DEV sigue el flag __DEV__ de React Native/Expo (true en desarrollo).
 */

export const IS_DEV = __DEV__;

/**
 * Si true, AppContext puede inyectar dependencias mock en lugar de las reales.
 * Por defecto false; activar solo cuando se quiera probar sin SQLite/implementaciones reales.
 */
export const MOCK_DEPS = false;
