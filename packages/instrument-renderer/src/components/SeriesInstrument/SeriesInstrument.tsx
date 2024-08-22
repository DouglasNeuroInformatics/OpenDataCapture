import { Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from 'react-i18next';

export const SeriesInstrument = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-grow flex-col items-center justify-center text-center">
      <Heading className="my-32 font-medium" variant="h5">
        {t('seriesInstrumentContent.inProgress')}
      </Heading>
    </div>
  );
};
