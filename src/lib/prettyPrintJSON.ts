export function prettyPrintJSON(value: unknown, indent = 2): string {
  try {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    return JSON.stringify(value, null, indent);
  } catch {
    return String(value);
  }
}
