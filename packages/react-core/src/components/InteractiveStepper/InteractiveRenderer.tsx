import { useCallback, useContext } from 'react';

import { StepperContext } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { InteractiveInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

export type InteractiveRendererProps = {
  instrument: InteractiveInstrument<unknown, Language>;
  onSubmit: (data: unknown) => Promise<void>;
};

export const InteractiveRenderer = ({ instrument, onSubmit }: InteractiveRendererProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation('core');

  const done = useCallback((data: unknown) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data, null, 2));
    void onSubmit(data).then(() => {
      updateIndex('increment');
    });
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold">{t('steps.questions')}</h3>
      {instrument.content.render(done)}
    </div>
  );
};
