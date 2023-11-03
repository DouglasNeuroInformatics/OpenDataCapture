import { useContext } from 'react';

import type { FormDataType } from '@douglasneuroinformatics/form-types';
import { Button, StepperContext } from '@douglasneuroinformatics/ui';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { FormOverviewItem } from './FormOverviewItem';

type FormOverviewProps = {
  form: FormInstrument<FormDataType, Language>;
};

export const FormOverview = ({ form }: FormOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);
  const { t } = useTranslation(['instruments', 'common']);
  return (
    <div className="mb-2">
      <h3 className="text-xl font-semibold">{t('form.steps.overview')}</h3>
      <div className="mb-8">
        <FormOverviewItem heading={t('props.description')} text={form.details.description} />
        <FormOverviewItem
          heading={t('common:language')}
          text={match(form.language)
            .with('en', () => t('common:languages.english'))
            .with('fr', () => t('common:languages.french'))
            .otherwise(() => form.language)}
        />
        <FormOverviewItem
          heading={t('props.estimatedDuration')}
          text={t('overview.estimatedDuration', {
            minutes: form.details.estimatedDuration
          })}
        />
        <FormOverviewItem heading={t('props.instructions')} text={form.details.instructions} />
      </div>
      <Button
        className="w-full"
        label={t('common:begin')}
        onClick={() => {
          updateIndex('increment');
        }}
      />
    </div>
  );
};
