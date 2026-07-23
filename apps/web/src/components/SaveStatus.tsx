import React from 'react';

import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CheckIcon, Loader2Icon } from 'lucide-react';

export const SaveStatus = ({ state }: { state: 'idle' | 'saved' | 'saving' }) => {
  const { t } = useTranslation();
  if (state === 'idle') {
    return null;
  }
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/95 px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-800/95">
      {state === 'saving' ? (
        <React.Fragment>
          <Loader2Icon className="text-muted-foreground h-3.5 w-3.5 animate-spin" />
          <span className="text-muted-foreground">{t({ en: 'Saving…', es: 'Guardando…', fr: 'Enregistrement…' })}</span>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <CheckIcon className="h-3.5 w-3.5 text-green-600" />
          <span>
            {t({ en: 'All changes saved', es: 'Todos los cambios guardados', fr: 'Modifications enregistrées' })}
          </span>
        </React.Fragment>
      )}
    </div>
  );
};
