import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';

import { $ApplicationSettingsSearch, SETTINGS_TABS } from '../tabs';

const mocks = vi.hoisted(() => ({
  mailSettingsQueryOptions: vi.fn(() => ({ queryKey: ['mail-settings'] }))
}));

vi.mock('@/hooks/useMailSettingsQuery', () => ({ mailSettingsQueryOptions: mocks.mailSettingsQueryOptions }));
vi.mock('../FeaturesTab', () => ({ FeaturesTab: () => null }));
vi.mock('../InterfaceTab', () => ({ InterfaceTab: () => null }));
vi.mock('../MailTab', () => ({ MailTab: () => null }));

describe('$ApplicationSettingsSearch', () => {
  it('should leave the tab unset for a bare address, so the router does not rewrite it to add one', () => {
    expect($ApplicationSettingsSearch.parse({})).toEqual({ tab: undefined });
  });

  it('should keep a requested tab', () => {
    expect($ApplicationSettingsSearch.parse({ tab: 'mail' })).toEqual({ tab: 'mail' });
  });

  it('should drop an unknown tab rather than fail, so a mistyped link still opens the page', () => {
    expect($ApplicationSettingsSearch.parse({ tab: 'nonsense' })).toEqual({ tab: undefined });
  });
});

describe('SETTINGS_TABS', () => {
  it('should prefetch the mail settings for the mail tab, so it renders without a waterfall', async () => {
    const queryClient = new QueryClient();
    const ensureQueryData = vi.spyOn(queryClient, 'ensureQueryData').mockResolvedValue(undefined);
    await SETTINGS_TABS.find(({ value }) => value === 'mail')?.prefetch?.(queryClient);
    expect(ensureQueryData).toHaveBeenCalledWith({ queryKey: ['mail-settings'] });
  });
});
