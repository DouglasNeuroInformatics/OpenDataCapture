import { localizeZodErrors } from '@opendatacapture/react-core';

import i18n from './i18n';

/**
 * Localizes validation messages for this bundle's zod, which backs the app's own forms, and for the
 * runtime-served zod that instrument bundles import at runtime. See `localizeZodErrors` for why the
 * two are distinct module instances.
 */
const localizeValidationErrors = (): Promise<void> => {
  return localizeZodErrors({ targets: ['app', 'runtime'], translator: i18n });
};

export { localizeValidationErrors };
