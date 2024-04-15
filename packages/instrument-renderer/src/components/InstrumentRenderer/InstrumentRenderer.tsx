import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';

import { Spinner } from '@douglasneuroinformatics/libui/components';
import { useWindowSize } from '@douglasneuroinformatics/libui/hooks';
import { cn } from '@douglasneuroinformatics/libui/utils';
import type { InterpretOptions } from '@opendatacapture/instrument-interpreter';
import { ErrorFallback } from '@opendatacapture/react-core';
import type { InstrumentKind } from '@opendatacapture/schemas/instrument';
import type { Subject } from '@opendatacapture/schemas/subject';
import { FileCheckIcon, MonitorIcon, PrinterIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import type { Promisable } from 'type-fest';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InstrumentSummary } from '../InstrumentSummary';
import { InteractiveContent } from '../InteractiveContent';

export type InstrumentRendererProps<TKind extends InstrumentKind> = {
  bundle: string;
  className?: string;
  customErrorFallback?: React.FC<{ error: Error }>;
  onSubmit: (data: unknown) => Promisable<void>;
  options?: InterpretOptions<TKind>;
  subject?: Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;
};

export const InstrumentRenderer = <TKind extends InstrumentKind>({
  bundle,
  className,
  customErrorFallback,
  onSubmit,
  options,
  subject
}: InstrumentRendererProps<TKind>) => {
  const [data, setData] = useState<unknown>();
  const { height, width } = useWindowSize();
  const { i18n, t } = useTranslation();
  const icons = useRef<HTMLDivElement[]>([]);
  const interpreted = useInterpretedInstrument(bundle, options);
  const [divideStyles, setDivideStyles] = useState<React.CSSProperties[]>([]);

  const steps = useMemo(
    () => [
      {
        icon: <FileCheckIcon />,
        label: t('steps.overview')
      },
      {
        icon: <MonitorIcon />,
        label: t('steps.questions')
      },
      {
        icon: <PrinterIcon />,
        label: t('steps.summary')
      }
    ],
    [i18n.resolvedLanguage]
  );
  const [index, updateIndex] = useReducer((prevIndex: number, action: 'decrement' | 'increment') => {
    if (action === 'decrement' && prevIndex > 0) {
      return prevIndex - 1;
    } else if (action === 'increment' && prevIndex < steps.length - 1) {
      return prevIndex + 1;
    }
    return prevIndex;
  }, 0);

  useEffect(() => {
    const styles: React.CSSProperties[] = [];
    for (let i = 0; i < steps.length - 1; i++) {
      const current = icons.current[i];
      const next = icons.current[i + 1];
      const left = current.offsetLeft + current.offsetWidth;
      styles.push({
        left,
        width: next.offsetLeft - left
      });
    }
    setDivideStyles(styles);
  }, [height, width]);

  async function handleSubmit<T>(data: T) {
    await onSubmit(data);
    updateIndex('increment');
    setData(data);
  }

  return (
    <div className={cn('h-full w-full', className)}>
      <div className="relative mb-10 flex items-center justify-between">
        {steps.map((step, i) => {
          return (
            <React.Fragment key={i}>
              <div className="flex items-center">
                <div className="flex flex-col items-center justify-center">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-full bg-sky-700 py-3 text-white transition duration-500 ease-in-out [&>*]:h-full [&>*]:w-full',
                      i > index && 'bg-slate-200 dark:bg-slate-700'
                    )}
                    ref={(e) => {
                      icons.current[i] = e!;
                    }}
                  >
                    {step.icon}
                  </div>
                  <span className="text-muted-foreground mt-2 text-xs font-medium uppercase">{step.label}</span>
                </div>
              </div>
              {i !== steps.length - 1 && (
                <div
                  className={cn(
                    'absolute top-6 flex-auto border-t-2 transition duration-500 ease-in-out',
                    i >= index ? 'border-slate-200 dark:border-slate-700' : 'border-sky-700'
                  )}
                  style={divideStyles[i]}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      {match(interpreted)
        .with({ status: 'LOADING' }, () => <Spinner />)
        .with(
          { status: 'ERROR' },
          ({ error }) =>
            customErrorFallback?.({ error }) ?? (
              <ErrorFallback
                description={t('genericApology')}
                subtitle={t('failedToLoadInstrument')}
                title={t('somethingWentWrong')}
              />
            )
        )
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument })
            .with({ index: 0 }, () => (
              <InstrumentOverview instrument={instrument} onNext={() => updateIndex('increment')} />
            ))
            .with({ index: 1, instrument: { kind: 'FORM' } }, ({ instrument }) => (
              <FormContent instrument={instrument} onSubmit={handleSubmit} />
            ))
            .with({ index: 1, instrument: { kind: 'INTERACTIVE' } }, () => (
              <InteractiveContent bundle={bundle} onSubmit={handleSubmit} />
            ))
            .with({ index: 2 }, () => (
              <InstrumentSummary data={data} instrument={instrument} subject={subject} timeCollected={Date.now()} />
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </div>
  );
};
