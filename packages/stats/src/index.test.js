import { describe, expect, it } from 'vitest';

import * as stats from './index.js';

describe('Stats', () => {
  describe('mean', () => {
    it('should return NaN for an empty array', () => {
      expect(Number.isNaN(stats.mean([]))).toBe(true);
    });
    it('should return the correct mean for a non-empty array', () => {
      expect(stats.mean([1, 2, 3, 4, 5])).toBe(3);
    });
  });

  describe('std', () => {
    it('should return NaN for an array of only one number', () => {
      expect(Number.isNaN(stats.std([1]))).toBe(true);
    });
    it('should return the correct sample standard deviation for a non-empty array', () => {
      expect(stats.std([1, 2, 3, 4, 5]).toFixed(5)).toBe((1.5811388).toFixed(5));
    });
    it('should return the correct population standard deviation for a non-empty array', () => {
      expect(stats.std([1, 2, 3, 4, 5], true).toFixed(5)).toBe((1.4142136).toFixed(5));
    });
  });
});

describe('linearRegression', () => {
  it('should compute a very simple model', () => {
    expect(
      stats.linearRegression([
        [1, 2],
        [2, 3],
        [3, 4]
      ])
    ).toMatchObject({
      intercept: 1,
      slope: 1,
      stdErr: 0
    });
  });
  it('should compute a model where the fit is imperfect', () => {
    const result = stats.linearRegression([
      [1, 2],
      [2, 3],
      [3, 5]
    ]);
    expect(result.intercept).toBeCloseTo(0.333);
    expect(result.slope).toBeCloseTo(1.5);
    expect(result.stdErr).toBeCloseTo(0.288);
  });
});
