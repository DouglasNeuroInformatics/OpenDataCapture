import type { FormDataType, PartialFormDataType } from '@douglasneuroinformatics/libui-form-types';
import type { Language } from '@opendatacapture/schemas/core';
import type { FormInstrument, FormInstrumentContent, FormInstrumentFields } from '@opendatacapture/schemas/instrument';

/** Extract a flat array of form fields from the content. This function assumes there are no duplicate keys in groups  */
export function getFormFields<TData extends FormDataType>(
  content: FormInstrumentContent<TData, Language>
): FormInstrumentFields<TData, Language> {
  if (!Array.isArray(content)) {
    return content;
  }
  return content.reduce((prev, current) => ({ ...prev, ...current.fields }), content[0].fields) as FormInstrumentFields<
    TData,
    Language
  >;
}

export function extractFieldLabel<TData extends FormDataType>(
  form: FormInstrument<TData, Language>,
  key: string,
  data: TData | null = null
) {
  const field = getFormFields(form.content)[key];
  if (field.kind === 'dynamic') {
    return field.render(data as PartialFormDataType<TData>)?.label;
  }
  return field.label;
}
