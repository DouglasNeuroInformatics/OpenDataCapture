import { afterEach, describe, expect, it, vi } from 'vitest';

import { i18n } from '../i18n';
import { localizeValidationErrors } from '../zod';

const { localizeZodErrors } = vi.hoisted(() => ({
  localizeZodErrors: vi.fn(() => Promise.resolve())
}));

vi.mock('@opendatacapture/react-core', () => ({ localizeZodErrors }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('localizeValidationErrors', () => {
  it('should localize both the app and runtime zod instances, so instrument validation messages are translated too', async () => {
    await localizeValidationErrors();
    expect(localizeZodErrors).toHaveBeenCalledWith(expect.objectContaining({ targets: ['app', 'runtime'] }));
  });

  it('should translate with the gateway i18n instance, so messages follow the patient-selected language', async () => {
    await localizeValidationErrors();
    expect(localizeZodErrors).toHaveBeenCalledWith(expect.objectContaining({ translator: i18n }));
  });
});
