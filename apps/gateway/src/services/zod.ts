import { localizeZodErrors } from '@opendatacapture/react-core';

import { i18n } from './i18n';

/**
 * Must only be called from `entry-client.tsx`. The runtime target resolves a browser URL that does
 * not exist in node, and nothing is validated during SSR anyway — a patient's answers are parsed on
 * submit, in the browser.
 */
const localizeValidationErrors = (): Promise<void> => {
  return localizeZodErrors({ targets: ['app', 'runtime'], translator: i18n });
};

export { localizeValidationErrors };
