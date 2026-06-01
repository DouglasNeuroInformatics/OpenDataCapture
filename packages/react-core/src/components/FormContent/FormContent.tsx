import { Button, Dialog, Form, Heading } from '@douglasneuroinformatics/libui/components';
import { useTranslation } from '@douglasneuroinformatics/libui/hooks';
import type { AnyUnilingualFormInstrument, FormInstrument, InstrumentKind } from '@opendatacapture/runtime-core';
import { InfoIcon } from 'lucide-react';
import type { Promisable } from 'type-fest';

export type FormContentSubmitResult = { data: FormInstrument.Data; kind: Extract<InstrumentKind, 'FORM'> };

export type FormContentProps = {
  instrument: AnyUnilingualFormInstrument;
  onSubmit: (result: FormContentSubmitResult) => Promisable<void>;
};

export const FormContent = ({ instrument, onSubmit }: FormContentProps) => {
  const { t } = useTranslation();
  const instructions = instrument.clientDetails?.instructions ?? instrument.details.instructions;
  return (
    <div className="space-y-6">
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
      <Form
        preventResetValuesOnReset
        content={instrument.content}
        data-testid="form-content"
        initialValues={instrument.initialValues}
        validationSchema={instrument.validationSchema}
        onSubmit={(data) => void onSubmit({ data, kind: 'FORM' })}
      />
    </div>
  );
};
