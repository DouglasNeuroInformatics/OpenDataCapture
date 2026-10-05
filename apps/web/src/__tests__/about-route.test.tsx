import { i18n } from '@douglasneuroinformatics/libui/i18n';
import type { GatewayHealthcheckResult } from '@opendatacapture/schemas/gateway';
import type { ReleaseInfo } from '@opendatacapture/schemas/setup';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod/v4';

import { Route } from '@/routes/_app/about';

import '@/services/i18n';

type SetupStateData = {
  isGatewayEnabled: boolean;
  release: ReleaseInfo;
  uptime: number;
};

const BUILD_TIME = Date.UTC(2025, 0, 15, 12);

const PRODUCTION_RELEASE: ReleaseInfo = { buildTime: BUILD_TIME, type: 'production', version: '1.2.3' };

const DEVELOPMENT_RELEASE: ReleaseInfo = {
  branch: 'feature',
  buildTime: BUILD_TIME,
  commit: 'abc1234',
  type: 'development',
  version: '1.2.4'
};

const mocks = vi.hoisted(() => ({
  axios: { get: vi.fn() },
  gatewayHealthData: null as GatewayHealthcheckResult | null,
  setupState: null as null | SetupStateData
}));

vi.mock('axios', () => ({ default: mocks.axios }));
vi.mock('@/hooks/useSetupStateQuery', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/hooks/useSetupStateQuery')>()),
  useSetupStateQuery: () => ({ data: mocks.setupState })
}));

const renderPage = () => {
  vi.spyOn(Route, 'useLoaderData').mockImplementation(((options: {
    select: (match: { gatewayHealthData: GatewayHealthcheckResult | null }) => unknown;
  }) => options.select({ gatewayHealthData: mocks.gatewayHealthData })) as typeof Route.useLoaderData);
  const Component = Route.options.component!;
  return render(<Component />);
};

const itemsOf = (testId: string) => {
  return Array.from(screen.getByTestId(testId).querySelectorAll('li'), (item) => item.textContent);
};

const uptimeSeconds = () => {
  const [hours, minutes, seconds] = itemsOf('about-core-api-info').at(-1)!.slice('Uptime: '.length).split(':');
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
};

const runLoader = async (isGatewayEnabled: boolean) => {
  const ensureQueryData = vi.fn().mockResolvedValue({ isGatewayEnabled });
  const loader = Route.options.loader as (opts: object) => Promise<unknown>;
  const result = await loader({ context: { queryClient: { ensureQueryData } } });
  return { ensureQueryData, result };
};

describe('about page', () => {
  beforeEach(() => {
    i18n.changeLanguage('en');
    vi.stubGlobal('__RELEASE__', PRODUCTION_RELEASE);
    mocks.setupState = { isGatewayEnabled: false, release: DEVELOPMENT_RELEASE, uptime: 5 };
    mocks.gatewayHealthData = null;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should omit the branch and commit of a production web client, since a release is identified by its version', () => {
    renderPage();
    expect(itemsOf('about-web-client-info')).toEqual([
      'Build Date: January 15, 2025',
      'Build Type: Production',
      'Version: 1.2.3'
    ]);
  });

  it('should show the branch and commit of a non-production core API alongside its uptime', () => {
    renderPage();
    expect(itemsOf('about-core-api-info')).toEqual([
      'Build Date: January 15, 2025',
      'Build Type: Development',
      'Version: 1.2.4',
      'Branch: feature',
      'Commit: abc1234',
      'Uptime: 00:00:05'
    ]);
  });

  it('should translate the test build type', () => {
    mocks.setupState = { isGatewayEnabled: false, release: { ...DEVELOPMENT_RELEASE, type: 'test' }, uptime: 5 };
    renderPage();
    expect(itemsOf('about-core-api-info')).toContain('Build Type: Test');
  });

  it('should fold whole days of uptime into the hours, so a long-running server does not wrap around', () => {
    mocks.setupState = { isGatewayEnabled: false, release: DEVELOPMENT_RELEASE, uptime: 90_061 };
    renderPage();
    expect(itemsOf('about-core-api-info')).toContain('Uptime: 25:01:01');
  });

  it('should advance the uptime by exactly one second per tick, so the counter neither skips nor stalls', () => {
    vi.useFakeTimers();
    renderPage();
    const ticks = Array.from({ length: 3 }, () => {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      return uptimeSeconds();
    });
    expect([ticks[1]! - ticks[0]!, ticks[2]! - ticks[1]!]).toEqual([1, 1]);
  });

  // Known defect: TimeValue increments its counter and then formats counter + 1, so the display leads by a second.
  it.fails('should show the starting uptime plus the seconds elapsed since the page opened', () => {
    vi.useFakeTimers();
    renderPage();
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(itemsOf('about-core-api-info')).toContain('Uptime: 00:00:08');
  });

  it('should show an error instead of crashing when the uptime cannot be formatted', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mocks.setupState = { isGatewayEnabled: false, release: DEVELOPMENT_RELEASE, uptime: -1 };
    renderPage();
    expect(itemsOf('about-core-api-info')).toContain('Uptime: ERROR');
    expect(consoleError).toHaveBeenCalled();
  });

  it('should only report that a disabled gateway is disabled', () => {
    renderPage();
    expect(itemsOf('about-gateway-info')).toEqual(['Enabled: No']);
  });

  it('should show the release and uptime of a healthy gateway', () => {
    mocks.setupState = { isGatewayEnabled: true, release: DEVELOPMENT_RELEASE, uptime: 5 };
    mocks.gatewayHealthData = { ok: true, release: PRODUCTION_RELEASE, status: 200, uptime: 61 };
    renderPage();
    expect(itemsOf('about-gateway-info')).toEqual([
      'Enabled: Yes',
      'Status: 200',
      'Build Date: January 15, 2025',
      'Build Type: Production',
      'Version: 1.2.3',
      'Uptime: 00:01:01'
    ]);
  });

  it('should show only the status of an unhealthy gateway, since it reports no release', () => {
    mocks.setupState = { isGatewayEnabled: true, release: DEVELOPMENT_RELEASE, uptime: 5 };
    mocks.gatewayHealthData = { ok: false, status: 503, statusText: 'Service Unavailable' };
    renderPage();
    expect(itemsOf('about-gateway-info')).toEqual(['Enabled: Yes', 'Status: 503']);
  });

  it('should show the date the page was generated', () => {
    vi.useFakeTimers({ now: BUILD_TIME, toFake: ['Date'] });
    renderPage();
    expect(screen.getByText('Generated on January 15, 2025')).toBeTruthy();
  });
});

describe('about loader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch the gateway healthcheck when the gateway is enabled', async () => {
    const healthcheck = { ok: false, status: 503, statusText: 'Service Unavailable' };
    mocks.axios.get.mockResolvedValue({ data: healthcheck });
    const { ensureQueryData, result } = await runLoader(true);
    expect(ensureQueryData).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['setup-state'] }));
    expect(mocks.axios.get).toHaveBeenCalledWith('/v1/gateway/healthcheck');
    expect(result).toEqual({ gatewayHealthData: healthcheck });
  });

  it('should reject a malformed gateway healthcheck rather than render it', async () => {
    mocks.axios.get.mockResolvedValue({ data: { ok: 'maybe' } });
    await expect(runLoader(true)).rejects.toBeInstanceOf(z.ZodError);
  });

  it('should not contact the gateway when it is disabled', async () => {
    const { result } = await runLoader(false);
    expect(mocks.axios.get).not.toHaveBeenCalled();
    expect(result).toEqual({ gatewayHealthData: null });
  });
});
