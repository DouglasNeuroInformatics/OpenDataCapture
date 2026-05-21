import { useState } from 'react';

import { replacer } from '@douglasneuroinformatics/libjs';
import { Spinner } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { InterpretOptions } from '@opendatacapture/instrument-interpreter';
import type { AnyScalarInstrument } from '@opendatacapture/runtime-core';
import type { ScalarInstrumentBundleContainer } from '@opendatacapture/schemas/instrument';
import { match } from 'ts-pattern';

import { useInterpretedInstrument } from '../../hooks/useInterpretedInstrument';
import { FileInstrumentContent } from '../FileInstrumentContent';
import { FormContent } from '../FormContent';
import { InstrumentOverview } from '../InstrumentOverview';
import { InstrumentSummary } from '../InstrumentSummary';
import { InteractiveContent } from '../InteractiveContent';
import { ContentPlaceholder } from './ContentPlaceholder';
import { InstrumentRendererContainer } from './InstrumentRendererContainer';

import type { SubjectDisplayInfo } from '../../types';
import type { NavigationBlockerComponent } from '../NavigationBlockerDialog';
import type { AnyContentResult, InstrumentSubmitHandler } from './types';

export type ScalarInstrumentRendererProps = {
  className?: string;
  NavigationBlocker?: NavigationBlockerComponent;
  /** @deprecated */
  onCompileError?: (error: Error) => void;
  onSubmit: InstrumentSubmitHandler<AnyScalarInstrument['kind']>;
  /** @deprecated */
  options?: InterpretOptions;
  subject?: SubjectDisplayInfo;
  target: Pick<ScalarInstrumentBundleContainer, 'bundle' | 'id'>;
};

export const ScalarInstrumentRenderer = ({
  className,
  NavigationBlocker,
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

  const handleSubmit = async ({ data, ...result }: AnyContentResult) => {
    await onSubmit?.({
      ...result,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: JSON.parse(JSON.stringify(data, replacer)),
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
          return (
            <ContentPlaceholder
              message={t({
                en: 'An unexpected error occurred while loading this instrument. Please contact the platform administrator for further assistance.',
                fr: "Une erreur inattendue s'est produite lors du chargement de cet instrument. Veuillez contacter l'administrateur de la plateforme pour obtenir de l'aide."
              })}
              title={t({
                en: 'Failed to Load Instrument',
                fr: "Échec du chargement de l'instrument"
              })}
            />
          );
        })
        .with({ status: 'DONE' }, ({ instrument }) =>
          match({ index, instrument })
            .with({ index: 0 }, () => <InstrumentOverview instrument={instrument} onNext={() => setIndex(1)} />)
            .with({ index: 1, instrument: { kind: 'FORM' } }, ({ instrument }) => (
              <FormContent instrument={instrument} onSubmit={handleSubmit} />
            ))
            .with({ index: 1, instrument: { kind: 'INTERACTIVE' } }, ({ instrument }) => (
              <InteractiveContent
                bundle={target.bundle}
                defaultFullscreen={instrument.content.defaultFullscreen}
                enableLanguageToggle={instrument.content.enableLanguageToggle}
                supportedLanguages={instrument.supportedLanguages}
                onSubmit={handleSubmit}
              />
            ))
            .with({ index: 1, instrument: { kind: 'FILE' } }, ({ instrument }) => {
              return (
                <FileInstrumentContent
                  instrument={{ ...instrument, id: target.id }}
                  NavigationBlocker={NavigationBlocker}
                  onSubmit={handleSubmit}
                />
              );
            })
            .with({ index: 2 }, () => (
              <InstrumentSummary data={data} instrument={instrument} subject={subject} timeCollected={Date.now()} />
            ))
            .otherwise(() => null)
        )
        .exhaustive()}
    </InstrumentRendererContainer>
  );
};
