import { z as z3 } from 'zod/v3';
import { z as z4 } from 'zod/v4';

import i18n from './i18n';

const requiredFieldMessage = () => i18n.t('core.form.requiredField');

const v3ErrorMap: z3.ZodErrorMap = (issue, ctx) => {
  const isUndefined = issue.code === 'invalid_type' && issue.received === 'undefined';
  const isEmptyString = issue.code === 'too_small' && issue.minimum === 1 && issue.type === 'string';
  if (isUndefined || isEmptyString) {
    return { message: requiredFieldMessage() };
  }
  return { message: ctx.defaultError };
};

const v4ErrorMap: z4.core.$ZodErrorMap = (issue) => {
  const isUndefined = issue.code === 'invalid_type' && issue.input === undefined;
  const isEmptyString = issue.code === 'too_small' && issue.minimum === 1 && issue.origin === 'string';
  if (isUndefined || isEmptyString) {
    return requiredFieldMessage();
  }
  return undefined;
};

z3.setErrorMap(v3ErrorMap);
z4.config({ customError: v4ErrorMap });

/**
 * Instrument bundles load zod with a native browser `import('/runtime/v1/zod@3.x/...')`, which is a
 * different module instance (and therefore a different global error registry) than the copy bundled
 * into this app — configuring the app's zod above does nothing for instrument validation schemas.
 * Importing the same URLs the bundles use shares the browser's module cache with them, so the maps
 * registered here are the ones their schemas see. v3 and v4 also keep separate registries, so both
 * must be configured.
 */
// Vite rewrites every import() it can see — in dev it appends ?import to the URL — which would
// load a second copy of the runtime module under a different URL and configure the wrong one.
// Constructing the import inside a Function hides it from vite, so the URL resolves exactly the
// way it does inside an instrument bundle (whose code is evaluated the same way).

const importRuntimeModule = new Function('url', 'return import(url)') as <TModule>(url: string) => Promise<TModule>;

const localizeInstrumentValidationErrors = async (): Promise<void> => {
  const [runtimeV3, runtimeV4] = await Promise.all([
    importRuntimeModule<typeof import('/runtime/v1/zod@3.x/index.js')>('/runtime/v1/zod@3.x/index.js'),
    importRuntimeModule<typeof import('/runtime/v1/zod@3.x/v4.js')>('/runtime/v1/zod@3.x/v4.js')
  ]);
  runtimeV3.z.setErrorMap(v3ErrorMap);
  runtimeV4.z.config({ customError: v4ErrorMap });
};

export { localizeInstrumentValidationErrors, v3ErrorMap, v4ErrorMap };
