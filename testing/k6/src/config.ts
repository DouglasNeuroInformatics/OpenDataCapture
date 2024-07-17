import type { Options, Stage } from 'k6/options';

/**
 * The type of load test to run:
 * - Smoke tests validate that your script works and that the system performs adequately under minimal load.
 * - Average-load test assess how your system performs under expected normal conditions.
 * - Stress tests assess how a system performs at its limits when load exceeds the expected average.
 * @see https://grafana.com/docs/k6/latest/testing-guides/test-types/
 */
type TestType = 'average' | 'breakpoint' | 'smoke' | 'stress';

export type ConfigParams = {
  type: TestType;
};

export class Config implements Options {
  stages: Stage[];
  thresholds = {
    checks: ['rate>.9'] // 90% of checks must pass
  };

  constructor({ type }: ConfigParams) {
    this.stages = this.workloads[type];
  }

  private get workloads() {
    return {
      average: [
        {
          duration: '1m',
          target: 100 // traffic ramp-up from 1 to 100 users
        },
        {
          duration: '2m', // stay at 100 users
          target: 100
        },
        {
          duration: '1m', // ramp-down to 0 users
          target: 0
        }
      ],
      breakpoint: [
        {
          duration: '5m',
          target: 100
        }
      ],
      smoke: [
        {
          duration: '30s',
          target: 1
        }
      ],
      stress: [
        {
          duration: '5m',
          target: 1000
        },
        {
          duration: '10m',
          target: 1000
        },
        {
          duration: '5m',
          target: 0
        }
      ]
    };
  }
}
