import { Injectable } from '@nestjs/common';

import { mean, standardDeviation } from 'simple-statistics';

/** Wraps all statistic libraries */
@Injectable()
export class StatsService {
  /** Returns the mean of the array */
  mean(arr: number[]): number {
    return mean(arr);
  }

  /** Returns the standard deviation of the array */
  std(arr: number[]): number {
    return standardDeviation(arr);
  }
}
