import React from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { BulkParseError } from '@/utils/bulk-assignments';

/**
 * Every failure the wizard shows goes through here. Messages arrive already sanitized — the parser
 * never puts a value from the user's file into one — so this only has to render them.
 */
export const ErrorList = ({ errors }: { errors: BulkParseError[] }) => {
  const { t } = useTranslation();
  if (errors.length === 0) {
    return null;
  }
  return (
    <div
      // An explicit scale rather than `text-destructive`, which resolves to red-600 and is too
      // light to read comfortably against this tinted panel. The border and ground stay on the
      // token, so the panel still follows the theme.
      className="border-destructive/40 bg-destructive/5 rounded-md border p-4"
      data-testid="bulk-error-list"
      role="alert"
    >
      <p className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
        {t({
          en: 'Nothing has been created. Fix the following and try again:',
          fr: 'Rien n’a été créé. Corrigez ce qui suit et réessayez :'
        })}
      </p>
      <ul className="list-disc space-y-1 pl-5 text-sm text-red-800 dark:text-red-300">
        {errors.map((error, index) => (
          <li key={index}>
            {error.row !== undefined && (
              <span className="font-medium">{t({ en: `Row ${error.row}: `, fr: `Ligne ${error.row} : ` })}</span>
            )}
            {error.message}
          </li>
        ))}
      </ul>
    </div>
  );
};
