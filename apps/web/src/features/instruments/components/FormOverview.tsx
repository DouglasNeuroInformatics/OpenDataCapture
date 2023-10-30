import { useContext } from 'react';

import { Button, StepperContext } from '@douglasneuroinformatics/ui';
import type { InstrumentDetails } from '@open-data-capture/common/instrument';
import { useTranslation } from 'react-i18next';

type FormOverviewItemProps = {
  heading: string;
  text: string | string[];
};

const FormOverviewItem = ({ heading, text }: FormOverviewItemProps) => {
  return (
    <div className="my-5">
      <h5 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">{heading}</h5>
      {Array.isArray(text) ? (
        <ul>
          {text.map((s, i) => (
            <li className="my-3" key={i}>
              {s}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-600 dark:text-slate-300">{text}</p>
      )}
    </div>
  );
};

type FormOverviewProps = {
  details: InstrumentDetails;
};

export const FormOverview = ({
  details: { description, estimatedDuration, instructions, language }
}: FormOverviewProps) => {
  const { updateIndex } = useContext(StepperContext);

  const { t } = useTranslation();
  return (
    <div className="mb-2">
      <div className="mb-5">
        <FormOverviewItem heading={t('instruments.formPage.overview.description')} text={description} />
        <FormOverviewItem heading={t('instruments.formPage.overview.language')} text={t(`languages.${language}`)} />
        <FormOverviewItem
          heading={t('instruments.formPage.overview.estimated Duration')}
          text={`${estimatedDuration} Minutes`}
        />
        <FormOverviewItem heading={t('instruments.formPage.overview.instructions')} text={instructions} />
      </div>
      <Button
        label={t('instruments.formPage.overview.begin')}
        onClick={() => {
          updateIndex('increment');
        }}
      />
    </div>
  );
};
