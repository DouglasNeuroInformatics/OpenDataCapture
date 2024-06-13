import type { Options, Stage } from 'k6/options';

/**
 * The type of load test to run:
 * - Smoke tests validate that your script works and that the system performs adequately under minimal load.
 * - Average-load test assess how your system performs under expected normal conditions.
 * - Stress tests assess how a system performs at its limits when load exceeds the expected average.
 * @see https://grafana.com/docs/k6/latest/testing-guides/test-types/
 */
type TestType = 'average' | 'smoke' | 'stress';

export class Config implements Options {
  stages: Stage[];
  thresholds = {
    checks: ['rate == 1'] // 100% of checks must pass
  };

  constructor(type: TestType) {
    this.stages = this.workloads[type];
  }

  private get workloads() {
    return {
      average: [
        {
          duration: '30s',
          target: 10 // traffic ramp-up from 1 to 10 users
        },
        {
          duration: '1m', // stay at 10 users
          target: 10
        },
        {
          duration: '30s', // ramp-down to 0 users
          target: 0
        }
      ],
      smoke: [
        {
          duration: '3s',
          target: 1
        }
      ],
      stress: [
        {
          duration: '1m',
          target: 100
        },
        {
          duration: '2m',
          target: 100
        },
        {
          duration: '1m',
          target: 0
        }
      ]
    };
  }
}
