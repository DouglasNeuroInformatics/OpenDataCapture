import { Button, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import { ClipboardListIcon } from 'lucide-react';

import { SubmissionSavedNotice } from './SubmissionSavedNotice';

export type SeriesInterstitialProps = {
  /** Whether an item of this series has already been submitted. */
  completedItem: boolean;
  onBegin: () => void;
  /** Whether the host persists each submission, and so whether the save can be confirmed. */
  savesSubmissions: boolean;
};

/** The screen between the items of a series: what just happened, and the way on to the next item. */
export const SeriesInterstitial = ({ completedItem, onBegin, savesSubmissions }: SeriesInterstitialProps) => {
  const { t } = useTranslation();

  const beginLabel = completedItem
    ? t({ en: 'Begin Next Instrument', es: 'Comenzar el siguiente instrumento', fr: "Commencer l'instrument suivant" })
    : t({ en: 'Begin', es: 'Comenzar', fr: 'Commencer' });

  const beginButton = (
    <div className="pt-8">
      <Button type="button" onClick={onBegin}>
        {beginLabel}
      </Button>
    </div>
  );

  return (
    <div className="bg-muted/40 flex grow flex-col items-center justify-center rounded-md border border-dashed py-24">
      {savesSubmissions && completedItem ? (
        <SubmissionSavedNotice>{beginButton}</SubmissionSavedNotice>
      ) : (
        <div className="flex flex-col items-center gap-2 text-center">
          <ClipboardListIcon className="text-muted-foreground" style={{ height: '40px', width: '40px' }} />
          <Heading variant="h4">
            {t({
              en: 'Series Instrument in Progress',
              es: 'Serie de instrumentos en proceso',
              fr: "Série d'instruments en cours"
            })}
          </Heading>
          <p className="text-muted-foreground max-w-prose pt-2 text-sm">
            {t({
              en: 'The instruments of this series are administered one after another.',
              es: 'Los instrumentos de esta serie se administran uno tras otro.',
              fr: "Les instruments de cette série sont administrés l'un après l'autre."
            })}
          </p>
          {beginButton}
        </div>
      )}
    </div>
  );
};
