import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';

import type { PreviewOriginResolution } from '@/preview/protocol';

export type PreviewOriginErrorProps = {
  reason: Extract<PreviewOriginResolution, { status: 'error' }>['reason'];
};

/** Shown instead of the preview when no origin other than the editor's is available to run it on. */
export const PreviewOriginError = ({ reason }: PreviewOriginErrorProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <Heading className="font-bold" variant="h4">
        {t({ en: 'Preview Unavailable', fr: 'Aperçu indisponible' })}
      </Heading>
      <p className="text-sm">
        {reason === 'same-origin'
          ? t({
              en: 'The preview origin is the same as this page. Instruments are only run on a separate origin, so that their code cannot read this page. Set PLAYGROUND_PREVIEW_ORIGIN to a different host that serves this site.',
              fr: "L'origine de l'aperçu est la même que celle de cette page. Les instruments ne sont exécutés que sur une origine distincte, afin que leur code ne puisse pas lire cette page. Définissez PLAYGROUND_PREVIEW_ORIGIN sur un hôte différent qui sert ce site."
            })
          : t({
              en: 'No preview origin is configured for this host. Instruments are only run on a separate origin, so that their code cannot read this page. Set PLAYGROUND_PREVIEW_ORIGIN to a different host that serves this site.',
              fr: "Aucune origine d'aperçu n'est configurée pour cet hôte. Les instruments ne sont exécutés que sur une origine distincte, afin que leur code ne puisse pas lire cette page. Définissez PLAYGROUND_PREVIEW_ORIGIN sur un hôte différent qui sert ce site."
            })}
      </p>
    </div>
  );
};
