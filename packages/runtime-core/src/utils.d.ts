import type { SnakeCasedProperties } from 'type-fest';

/** @alpha */
export declare function asSnakeCase<T extends { [key: string]: any }>(target: T): SnakeCasedProperties<T>;
