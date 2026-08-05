import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { CheckIcon, CircleAlertIcon, Loader2Icon } from 'lucide-react';

const CONTENT = {
  error: {
    icon: <CircleAlertIcon className="text-destructive h-3.5 w-3.5" />,
    label: {
      en: 'Could not save changes',
      es: 'No se pudieron guardar los cambios',
      fr: "Échec de l'enregistrement"
    }
  },
  saved: {
    icon: <CheckIcon className="h-3.5 w-3.5 text-green-600" />,
    label: { en: 'All changes saved', es: 'Todos los cambios guardados', fr: 'Modifications enregistrées' }
  },
  saving: {
    icon: <Loader2Icon className="text-muted-foreground h-3.5 w-3.5 animate-spin" />,
    label: { en: 'Saving…', es: 'Guardando…', fr: 'Enregistrement…' }
  }
};

export const SaveStatus = ({ state }: { state: 'error' | 'idle' | 'saved' | 'saving' }) => {
  const { t } = useTranslation();
  if (state === 'idle') {
    return null;
  }
  const { icon, label } = CONTENT[state];
  return (
    <div
      className="border-border bg-card/95 fixed bottom-4 right-4 z-50 flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-md backdrop-blur"
      data-testid={`save-status-${state}`}
    >
      {icon}
      <span className={state === 'saving' ? 'text-muted-foreground' : undefined}>{t(label)}</span>
    </div>
  );
};
