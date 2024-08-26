import { useState } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Spinner } from '@douglasneuroinformatics/libui/components';
import type { InterpretOptions } from '@opendatacapture/instrument-interpreter';
import type { Json } from '@opendatacapture/schemas/core';
import type { ScalarInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InstrumentSummary } from '../InstrumentSummary';
import { InteractiveContent } from '../InteractiveContent';
import { ContentPlaceholder } from './ContentPlaceholder';
import { InstrumentRendererContainer } from './InstrumentRendererContainer';

import type { InstrumentSubmitHandler, SubjectDisplayInfo } from '../../types';

export type ScalarInstrumentRendererProps = {
  className?: string;
  /** @deprecated */
  onCompileError?: (error: Error) => void;
  onSubmit: InstrumentSubmitHandler;
  /** @deprecated */
  options?: InterpretOptions;
  subject?: SubjectDisplayInfo;
  target: Pick<ScalarInstrumentBundleContainer, 'bundle' | 'id'>;
};

export const ScalarInstrumentRenderer = ({
  className,
  onCompileError,
  onSubmit,
  options,
  subject,
  target
}: ScalarInstrumentRendererProps) => {
  const [data, setData] = useState<unknown>();
  const interpreted = useInterpretedInstrument(target.bundle, options);
  const [index, setIndex] = useState<0 | 1 | 2>(0);
  const { t } = useTranslation();

  const handleSubmit = async (data: unknown) => {
    await onSubmit({
      data: JSON.parse(JSON.stringify(data, replacer)) as Json,
      instrumentId: target.id
    });
    setIndex(2);
    setData(data);
  };

  return (
    <InstrumentRendererContainer className={className} index={index}>
      {match(interpreted)
        .with({ status: 'LOADING' }, () => <Spinner />)
        .with({ status: 'ERROR' }, ({ error }) => {
          if (onCompileError) {
            onCompileError(error);
          }
          return <ContentPlaceholder message={t('failedToLoadInstrumentDesc')} title={t('failedToLoadInstrument')} />;
        })
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument })
            .with({ index: 0 }, () => <InstrumentOverview instrument={instrument} onNext={() => setIndex(1)} />)
            .with({ index: 1, instrument: { kind: 'FORM' } }, ({ instrument }) => (
              <FormContent instrument={instrument} onSubmit={handleSubmit} />
            ))
            .with({ index: 1, instrument: { kind: 'INTERACTIVE' } }, () => (
              <InteractiveContent bundle={target.bundle} onSubmit={handleSubmit} />
            ))
            .with({ index: 2 }, () => (
              <InstrumentSummary data={data} instrument={instrument} subject={subject} timeCollected={Date.now()} />
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </InstrumentRendererContainer>
  );
};
