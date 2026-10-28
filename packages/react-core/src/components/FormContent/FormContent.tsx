import { useEffect, useRef, useState } from 'react';

import { Button, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument, FormInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { InfoIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';

import type { LocalizedText } from '../../types';

// libui wraps every field in `data-field-group` and renders that field's errors inside it as
// `error-message-text`; neither is configurable from `Form`'s props.
const INVALID_FIELD_SELECTOR = '[data-field-group]:has([data-testid="error-message-text"])';

const FOCUSABLE_SELECTOR = [
  'input:not([type="hidden"]):not([aria-hidden="true"]):not(:disabled)',
  'textarea:not(:disabled)',
  'button:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

export type FormContentSubmitResult = { data: FormInstrument.Data; kind: Extract<InstrumentKind, 'FORM'> };

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (result: FormContentSubmitResult) => Promisable<void>;
  /** A localizable submit-button label; resolved to the active language here. */
  submitButtonLabel?: LocalizedText;
};

export const FormContent = ({ instrument, onSubmit, submitButtonLabel }: FormContentProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [failedSubmitCount, setFailedSubmitCount] = useState(0);

  useEffect(() => {
    if (failedSubmitCount === 0) {
      return;
    }
    const firstInvalidField = containerRef.current?.querySelector<HTMLElement>(INVALID_FIELD_SELECTOR);
    if (!firstInvalidField) {
      return;
    }
    firstInvalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstInvalidField.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus({ preventScroll: true });
  }, [failedSubmitCount]);

  const instructions = instrument.clientDetails?.instructions ?? instrument.details.instructions;
  return (
    <div className="space-y-6" ref={containerRef}>
      <div className="flex gap-2">
        <Heading variant="h4">{instrument.clientDetails?.title ?? instrument.details.title}</Heading>
        <Dialog>
          <Dialog.Trigger asChild>
            <Button disabled={!instructions?.length} size="icon" variant="ghost">
              <InfoIcon />
            </Button>
          </Dialog.Trigger>
          <Dialog.Content className="sm:max-w-106.25">
            <Dialog.Header>
              <Dialog.Title>
                {t({
                  en: 'Instructions',
                  es: 'Instrucciones',
                  fr: 'Instructions'
                })}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body className="py-2">
              <p className="text-muted-foreground text-sm">{instructions?.join(', ')}</p>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog>
      </div>
      {/*
        libui's `resetBtn` and `preventResetValuesOnReset` are two ends of one switch: its `reset`
        only empties the fields when the latter is absent, so offering the button while preventing
        the clear would give a Reset that wipes validation errors and leaves every answer in place.
        An instrument therefore either has a working button or has none.
      */}
      <Form
        content={instrument.content}
        data-testid="form-content"
        initialValues={instrument.initialValues}
        preventResetValuesOnReset={!instrument.resetButton}
        resetBtn={instrument.resetButton}
        submitBtnLabel={submitButtonLabel ? t(submitButtonLabel) : undefined}
        validationSchema={instrument.validationSchema}
        onError={() => setFailedSubmitCount((count) => count + 1)}
        onSubmit={(data) => {
          setFailedSubmitCount(0);
          void onSubmit({ data, kind: 'FORM' });
        }}
      />
      {failedSubmitCount > 0 && (
        <p className="text-destructive text-sm font-medium" data-testid="form-error-summary" role="alert">
          {t({
            en: 'Some fields are incomplete or invalid. Please resolve the errors above before continuing.',
            es: 'Algunos campos están incompletos o no son válidos. Corrija los errores anteriores antes de continuar.',
            fr: 'Certains champs sont incomplets ou invalides. Veuillez corriger les erreurs ci-dessus avant de continuer.'
          })}
        </p>
      )}
    </div>
  );
};
