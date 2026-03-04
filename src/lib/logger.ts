/**
 * Logger centralizado.
 * En desarrollo escribe en consola con prefijo [Gymrat].
 * En producción se puede dejar sin efecto o enviar solo errores a un servicio.
 */

import { IS_DEV } from '@/config';

const PREFIX = '[Gymrat]';

function formatArgs(args: unknown[]): unknown[] {
  return [PREFIX, ...args];
}

export const logger = {
  info(...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.log(...formatArgs(args));
    }
  },
  warn(...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.warn(...formatArgs(args));
    }
  },
  error(...args: unknown[]): void {
    // En prod también podemos loguear errores (ej. a servicio)
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.error(...formatArgs(args));
    }
  },
  debug(...args: unknown[]): void {
    if (IS_DEV) {
      // eslint-disable-next-line no-console
      console.debug(...formatArgs(args));
    }
  },
};
