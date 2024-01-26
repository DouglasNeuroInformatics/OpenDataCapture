import { useState } from 'react';

import { Spinner, Stepper, cn } from '@douglasneuroinformatics/ui';
import {
  ComputerDesktopIcon,
  DocumentCheckIcon,
  PrinterIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import type { Subject } from '@open-data-capture/common/subject';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import { useInterpretedInstrument } from '../hooks/useInterpretedInstrument';
import { FormContent } from './FormContent';
import { InstrumentOverview } from './InstrumentOverview';
import { InstrumentSummary } from './InstrumentSummary';
import { InteractiveContent } from './InteractiveContent';

export type InstrumentRendererProps = {
  bundle: string;
  className?: string;
  onSubmit: (data: unknown) => Promisable<void>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
};

export const InstrumentRenderer = ({ bundle, className, onSubmit, subject }: InstrumentRendererProps) => {
  const [data, setData] = useState<unknown>();
  const interpreted = useInterpretedInstrument(bundle);
  const { t } = useTranslation();

  async function handleSubmit<T>(data: T) {
    await onSubmit(data);
    setData(data);
  }

  if (interpreted.status === 'LOADING') {
    return <Spinner />;
  } else if (interpreted.status === 'ERROR') {
    return (
      <div className="flex min-h-screen  flex-col items-center justify-center gap-1 p-3 text-center">
        <h1 className="text-muted text-sm font-semibold uppercase tracking-wide">{t('error')}</h1>
        <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
          {t('failedToLoadInstrument')}
        </h3>
      </div>
    );
  }

  const content = match(interpreted.instrument)
    .with({ kind: 'FORM' }, (instrument) => ({
      element: <FormContent instrument={instrument} onSubmit={handleSubmit} />,
      icon: <QuestionMarkCircleIcon />
    }))
    .with({ kind: 'INTERACTIVE' }, () => ({
      element: <InteractiveContent bundle={bundle} onSubmit={handleSubmit} />,
      icon: <ComputerDesktopIcon />
    }))
    .exhaustive();

  return (
    <Stepper
      className={cn('mx-auto h-full max-w-3xl grow xl:max-w-4xl', className)}
      steps={[
        {
          element: <InstrumentOverview instrument={interpreted.instrument} />,
          icon: <DocumentCheckIcon />,
          label: t('steps.overview')
        },
        {
          ...content,
          label: t('steps.questions')
        },
        {
          element: (
            <InstrumentSummary
              data={data}
              instrument={interpreted.instrument}
              subject={subject}
              timeCollected={Date.now()}
            />
          ),
          icon: <PrinterIcon />,
          label: t('steps.summary')
        }
      ]}
    />
  );
};
