/* eslint-disable @typescript-eslint/no-explicit-any */

export const COMPONENT_KEY = 'COMPONENT';

export const Render = <
  T extends object,
  K extends Extract<keyof T, string>,
  P extends T[K] extends (...args: any[]) => infer R ? R : never
>(
  component: React.FC<P>
) => {
  return (target: T, propertyKey: K) => {
    Reflect.defineMetadata(COMPONENT_KEY, component, target[propertyKey] as object);
  };
};
