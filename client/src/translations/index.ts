import { z } from 'zod';

import i18n from './i18n';

const customErrorMap: z.ZodErrorMap = (error, ctx) => {
  console.log(error, ctx);
  switch (error.code) {
    case z.ZodIssueCode.too_small: {
      if (error.minimum === 1) {
        return { message: i18n.t('validationErrors.requiredField') };
      }
    }
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

export default i18n;
