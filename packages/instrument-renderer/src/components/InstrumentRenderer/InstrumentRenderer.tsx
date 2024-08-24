import { useState } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Spinner } from '@douglasneuroinformatics/libui/components';
import type { InterpretOptions } from '@opendatacapture/instrument-interpreter';
import { ErrorFallback } from '@opendatacapture/react-core';
import type { Json } from '@opendatacapture/schemas/core';
import type { InstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import type { Subject } from '@opendatacapture/schemas/subject';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import type { DistributedOmit, Promisable } from 'type-fest';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InstrumentSummary } from '../InstrumentSummary';
import { InteractiveContent } from '../InteractiveContent';
import { SeriesInstrument } from '../SeriesInstrument';
import { RendererContainer } from './RendererContainer';

export type SubjectDisplayInfo = Pick<Subject, 'dateOfBirth' | 'firstName' | 'id' | 'lastName' | 'sex'>;

export type InstrumentRendererProps = {
  className?: string;
  onCompileError?: (error: Error) => void;
  onSubmit: (data: Json) => Promisable<void>;
  options?: InterpretOptions;
  subject?: SubjectDisplayInfo;
  target: DistributedOmit<InstrumentBundleContainer, 'id'>;
};

export const InstrumentRenderer = ({
  className,
  onCompileError,
  onSubmit,
  options,
  subject,
  target
}: InstrumentRendererProps) => {
  const [data, setData] = useState<unknown>();
  const { t } = useTranslation();
  const interpreted = useInterpretedInstrument(target.bundle, options);
  const [index, setIndex] = useState<0 | 1 | 2>(0);

  const handleSubmit = async (data: unknown) => {
    await onSubmit(JSON.parse(JSON.stringify(data, replacer)) as Json);
    setIndex(2);
    setData(data);
  };

  return (
    <RendererContainer className={className} index={index}>
      {match(interpreted)
        .with({ status: 'LOADING' }, () => <Spinner />)
        .with({ status: 'ERROR' }, ({ error }) => {
          if (onCompileError) {
            onCompileError(error);
          }
          return (
            <ErrorFallback
              description={t('genericApology')}
              subtitle={t('failedToLoadInstrument')}
              title={t('somethingWentWrong')}
            />
          );
        })
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument })
            .with({ index: 0 }, () => <InstrumentOverview instrument={instrument} onNext={() => setIndex(1)} />)
            .with({ index: 1, instrument: { kind: 'FORM' } }, ({ instrument }) => (
              <FormContent instrument={instrument} onSubmit={handleSubmit} />
            ))
            .with({ index: 1, instrument: { kind: 'INTERACTIVE' } }, () => (
              <InteractiveContent bundle={target.bundle} onSubmit={onSubmit} />
            ))
            .with({ index: 1, instrument: { kind: 'SERIES' } }, () => <SeriesInstrument />)
            .with({ index: 2 }, () => (
              <InstrumentSummary data={data} instrument={instrument} subject={subject} timeCollected={Date.now()} />
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </RendererContainer>
  );
};
