import { IS_DEV } from './config';

const PREFIX = '[Gymrat]';

export const logger = {
  info(...args: unknown[]): void {
    if (IS_DEV) console.log(PREFIX, ...args);
  },
  warn(...args: unknown[]): void {
    if (IS_DEV) console.warn(PREFIX, ...args);
  },
  error(...args: unknown[]): void {
    console.error(PREFIX, ...args);
  },
  debug(...args: unknown[]): void {
    if (IS_DEV) console.debug(PREFIX, ...args);
  },
};
