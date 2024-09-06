import { snakeCase } from 'lodash-es';

export function asSnakeCase(target) {
  for (const key in target) {
    if (snakeCase(key) !== key) {
      target[snakeCase(key)] = target[key];
      delete target[key];
    }
  }
  return target;
}
