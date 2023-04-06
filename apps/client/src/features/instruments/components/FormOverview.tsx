import React, { useContext } from 'react';

import { FormDetails } from '@ddcp/common';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components';
import { StepperContext } from '@/context/StepperContext';

interface FormOverviewItemProps {
  heading: string;
  text: string;
}

const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div className="my-5">
      <h5 className="mb-1 text-xl font-semibold text-slate-900">{heading}</h5>
      <p className="text-slate-700">{text}</p>
    </div>
  );
};

interface FormOverviewProps {
  details: FormDetails;
}

export const FormOverview = ({
  details: { description, language, estimatedDuration, instructions }
}: FormOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  const { t } = useTranslation(['common', 'instruments']);
  return (
    <div className="mb-2">
      <div className="mb-5">
        <FormOverviewItem heading={t('instruments:formPage.overview.description')} text={description} />
        <FormOverviewItem heading={t('instruments:formPage.overview.language')} text={t(`languages.${language}`)} />
        <FormOverviewItem
          heading={t('instruments:formPage.overview.estimated Duration')}
          text={`${estimatedDuration} Minutes`}
        />
        <FormOverviewItem heading={t('instruments:formPage.overview.instructions')} text={instructions} />
      </div>
      <Button label={t('instruments:formPage.overview.begin')} onClick={() => updateIndex('increment')} />
    </div>
  );
};
