import { describe, expect, it } from 'vitest';

import { asSnakeCase } from '../utils.js';

describe('asSnakeCase', () => {
  it('should rename camelCase keys to snake_case while keeping their values', () => {
    expect(asSnakeCase({ firstName: 'Jane', totalScore: 10 })).toEqual({ first_name: 'Jane', total_score: 10 });
  });

  it.fails('should keep keys that are already snake_case, so the result matches SnakeCasedProperties<T>', () => {
    expect(asSnakeCase({ age: 30, first_name: 'Jane', lastName: 'Doe' })).toEqual({
      age: 30,
      first_name: 'Jane',
      last_name: 'Doe'
    });
  });
});
