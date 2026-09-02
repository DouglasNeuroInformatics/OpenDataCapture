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
      className="border-destructive/40 bg-destructive/5 rounded-md border p-4"
      data-testid="bulk-error-list"
      role="alert"
    >
      <p className="text-destructive mb-2 text-sm font-medium">
        {t({
          en: 'Nothing has been created. Fix the following and try again:',
          fr: 'Rien n’a été créé. Corrigez ce qui suit et réessayez :'
        })}
      </p>
      <ul className="text-destructive list-disc space-y-1 pl-5 text-sm">
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
