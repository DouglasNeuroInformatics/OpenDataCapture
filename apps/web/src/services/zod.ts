// Deliberately v3: this error map exists for instrument validation schemas, and most instruments are
// authored against /runtime/v1/zod@3.x. v3 and v4 keep separate global error registries, so moving
// this to v4 would silently stop localizing required-field errors for those instruments.
import { z } from 'zod/v3';

import i18n from './i18n';

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const isUndefined = issue.code === 'invalid_type' && issue.received === 'undefined';
  const isEmptyString = issue.code === 'too_small' && issue.minimum === 1 && issue.type === 'string';
  if (isUndefined || isEmptyString) {
    return { message: i18n.t('core.form.requiredField') };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);
