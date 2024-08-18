import type {
  FormInstrument,
  FormInstrumentContent,
  FormInstrumentFields,
  FormTypes,
  Language
} from '@opendatacapture/runtime-core';

/** Extract a flat array of form fields from the content. This function assumes there are no duplicate keys in groups  */
export function getFormFields<TData extends FormTypes.FormDataType>(
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

export function extractFieldLabel<TData extends FormTypes.FormDataType>(
  form: FormInstrument<TData, Language>,
  key: string,
  data: null | TData = null
) {
  const field = getFormFields(form.content)[key];
  if (field.kind === 'dynamic') {
    return field.render(data as FormTypes.PartialFormDataType<TData>)?.label;
  }
  return field.label;
}
