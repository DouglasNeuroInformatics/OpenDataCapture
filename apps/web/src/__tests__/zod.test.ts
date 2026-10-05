import { beforeEach, describe, expect, it, vi } from 'vitest';

import i18n from '@/services/i18n';
import { localizeValidationErrors } from '@/services/zod';

const { localizeZodErrors } = vi.hoisted(() => ({ localizeZodErrors: vi.fn(() => Promise.resolve()) }));

vi.mock('@opendatacapture/react-core', () => ({ localizeZodErrors }));

describe('localizeValidationErrors', () => {
  beforeEach(() => {
    localizeZodErrors.mockClear();
  });

  it("should localize both the app's zod and the runtime zod that instruments import", async () => {
    await localizeValidationErrors();
    expect(localizeZodErrors).toHaveBeenCalledWith({ targets: ['app', 'runtime'], translator: i18n });
  });

  it('should wait for the runtime zod to be localized before resolving', async () => {
    const failure = new Error('runtime unavailable');
    localizeZodErrors.mockReturnValueOnce(Promise.reject(failure));
    await expect(localizeValidationErrors()).rejects.toBe(failure);
  });
});
