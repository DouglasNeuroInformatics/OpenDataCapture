import type { FormDataType } from '@douglasneuroinformatics/form-types';
import type { Language } from '@open-data-capture/common/core';
import type { FormInstrument as FormInstrumentType, InstrumentLanguage } from '@open-data-capture/common/instrument';
import { FormStepper } from '@open-data-capture/react-core/components/FormStepper';
import { translateFormInstrument } from '@open-data-capture/react-core/utils/translate-instrument';
import { useTranslation } from 'react-i18next';

export type FormInstrumentProps<TData extends FormDataType, TLanguage extends InstrumentLanguage> = {
  instrument: FormInstrumentType<TData, TLanguage>;
};

export const FormInstrument = <TData extends FormDataType, TLanguage extends InstrumentLanguage>({
  instrument
}: FormInstrumentProps<TData, TLanguage>) => {
  const { i18n } = useTranslation();

  const form = translateFormInstrument(instrument, i18n.resolvedLanguage === 'fr' ? 'fr' : 'en') as FormInstrumentType<
    TData,
    Language
  >;

  const handleSubmit = (data: FormDataType) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data));
  };

  return (
    <div>
      <h3 className="my-8 text-center text-xl font-bold">{form.details.title}</h3>
      <FormStepper form={form as FormInstrumentType<FormDataType, Language>} onSubmit={handleSubmit} />
    </div>
  );
};
