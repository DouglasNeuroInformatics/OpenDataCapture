import { useState } from 'react';

import { Spinner, Stepper } from '@douglasneuroinformatics/ui';
import {
  ComputerDesktopIcon,
  DocumentCheckIcon,
  PrinterIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { useResolvedInstrument } from '../hooks/useResolvedInstrument';
import { FormContent } from './FormContent';
import { InstrumentOverview } from './InstrumentOverview';
import { InstrumentSummary } from './InstrumentSummary';
import { InteractiveContent } from './InteractiveContent';

export type InstrumentRendererProps = {
  bundle: string;
  onSubmit: (data: unknown) => Promise<void>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
};

export const InstrumentRenderer = ({ bundle, onSubmit, subject }: InstrumentRendererProps) => {
  const [data, setData] = useState<unknown>();
  const instrument = useResolvedInstrument(bundle);
  const { t } = useTranslation();

  async function handleSubmit<T>(data: T) {
    await onSubmit(data);
    setData(data);
  }

  if (!instrument) {
    return <Spinner />;
  }

  const content = match(instrument)
    .with({ kind: 'FORM' }, (instrument) => ({
      element: <FormContent instrument={instrument} onSubmit={handleSubmit} />,
      icon: <QuestionMarkCircleIcon />
    }))
    .with({ kind: 'INTERACTIVE' }, (instrument) => ({
      element: <InteractiveContent instrument={instrument} onSubmit={handleSubmit} />,
      icon: <ComputerDesktopIcon />
    }))
    .exhaustive();

  return (
    <Stepper
      steps={[
        {
          element: <InstrumentOverview instrument={instrument} />,
          icon: <DocumentCheckIcon />,
          label: t('steps.overview')
        },
        {
          ...content,
          label: t('steps.questions')
        },
        {
          element: (
            <InstrumentSummary data={data} instrument={instrument} subject={subject} timeCollected={Date.now()} />
          ),
          icon: <PrinterIcon />,
          label: t('steps.summary')
        }
      ]}
    />
  );
};