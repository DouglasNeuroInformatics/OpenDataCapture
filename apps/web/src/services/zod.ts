import { z } from 'zod';

import i18n from './i18n';

const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
  const isUndefined = issue.code === 'invalid_type' && issue.received === 'undefined';
  const isEmptyString = issue.code === 'too_small' && issue.minimum === 1 && issue.type === 'string';
  if (isUndefined || isEmptyString) {
    return { message: i18n.t('form.requiredField') };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);
