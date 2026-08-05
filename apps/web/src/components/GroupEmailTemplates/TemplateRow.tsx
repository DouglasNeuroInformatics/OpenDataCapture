import type React from 'react';

import { Button } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

export type TemplateRowProps = {
  /** Row-level buttons (view, edit, delete) rendered before the default indicator. */
  actions: React.ReactNode;
  isActive: boolean;
  isPending: boolean;
  label: string;
  onSetActive: () => void;
  /** Namespaces this row's test ids; `builtin` for the built-in template, else its id. */
  rowId: string;
};

/** One template in the list, with its actions and its "is the default" control. */
export const TemplateRow = ({ actions, isActive, isPending, label, onSetActive, rowId }: TemplateRowProps) => {
  const { t } = useTranslation();
  return (
    <div className="border-border flex flex-wrap items-center gap-2 rounded-md border p-2" data-testid="template-row">
      <span className="flex-1 text-sm font-medium">{label}</span>
      {actions}
      {isActive ? (
        <span
          className="bg-primary text-primary-foreground w-28 rounded-md py-1.5 text-center text-sm font-medium"
          data-testid={`template-active-${rowId}`}
        >
          {t({ en: 'Default', es: 'Predeterminada', fr: 'Par défaut' })}
        </span>
      ) : (
        <Button
          className="w-28 justify-center"
          data-testid={`template-set-active-${rowId}`}
          disabled={isPending}
          size="sm"
          type="button"
          variant="outline"
          onClick={onSetActive}
        >
          {t({ en: 'Set default', es: 'Establecer como predeterminada', fr: 'Définir par défaut' })}
        </Button>
      )}
    </div>
  );
};
