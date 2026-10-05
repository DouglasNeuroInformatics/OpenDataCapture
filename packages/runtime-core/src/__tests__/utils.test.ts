import { describe, expect, it } from 'vitest';

import { asSnakeCase } from '../utils.js';

describe('asSnakeCase', () => {
  it('should rename camelCase keys to snake_case while keeping their values', () => {
    expect(asSnakeCase({ firstName: 'Jane', totalScore: 10 })).toEqual({ first_name: 'Jane', total_score: 10 });
  });

  it('should omit keys whose snake_case form is unchanged, so only renamed keys are returned', () => {
    expect(asSnakeCase({ age: 30, first_name: 'Jane', lastName: 'Doe' })).toEqual({ last_name: 'Doe' });
  });
});
