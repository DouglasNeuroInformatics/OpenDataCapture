import { snakeCase } from 'lodash-es';
import type { SnakeCasedProperties } from 'type-fest';

/** @alpha */
export function asSnakeCase<T extends { [key: string]: any }>(target: T) {
  const result: { [key: string]: any } = {};
  for (const key in target) {
    if (snakeCase(key) !== key) {
      result[snakeCase(key)] = target[key];
    }
  }
  return result as SnakeCasedProperties<T>;
}
