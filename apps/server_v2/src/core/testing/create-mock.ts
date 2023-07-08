import { mock } from 'node:test';

/**
 *
 * @param constructor - The ES6 class to mock
 * @param methods - An object with the properties/methods to implement
 * @returns The implemented methods with other methods implemented as
 */
export function createMock<T>(constructor: new (...args: any[]) => T, methods: Partial<T> = {}): Partial<T> {
  return new Proxy(methods, {
    get(target, property: Extract<keyof T, string>) {
      if (property in target) {
        return target[property];
      } else if (property in constructor.prototype) {
        const value = constructor.prototype[property];
        if (typeof value === 'function') {
          return mock.fn(constructor.prototype[property]);
        }
        throw new Error(`Default value not defined for non-function property: ${property}`);
      }
      throw new Error(`Unexpected property: ${property}`);
    }
  });
}
