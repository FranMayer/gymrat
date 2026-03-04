/**
 * Formatea un objeto como JSON legible para pantalla o logs.
 * Evita fallos con valores no serializables (ej. funciones).
 */

export function prettyPrintJSON(value: unknown, indent = 2): string {
  try {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}
