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
  const { t } = useTranslation('core');

  return (
    <div className="mb-2">
      <h3 className="text-xl font-semibold">{t('steps.overview')}</h3>
      <div className="mb-8">
        <FormOverviewItem heading={t('description')} text={form.details.description} />
        <FormOverviewItem
          heading={t('language')}
          text={match(form.language)
            .with('en', () => t('languages.english'))
            .with('fr', () => t('languages.french'))
            .otherwise(() => form.language)}
        />
        <FormOverviewItem
          heading={t('estimatedDuration')}
          text={t('estimatedDuration', {
            minutes: form.details.estimatedDuration
          })}
        />
        <FormOverviewItem heading={t('instructions')} text={form.details.instructions} />
      </div>
      <Button
        className="w-full"
        label={t('begin')}
        onClick={() => {
          updateIndex('increment');
        }}
      />
    </div>
  );
};
