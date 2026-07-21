import * as crypto from 'node:crypto';

/** Short, collision-resistant suffix for uniquely naming seeded test data. */
export function randomId(): string {
  return crypto.randomUUID().slice(0, 8);
}
