import type { FormInstrument, Language } from '@opendatacapture/runtime-core';

/** Extract a flat array of form fields from the content. This function assumes there are no duplicate keys in groups  */
export function getFormFields<TData extends FormInstrument.Data>(
  content: FormInstrument.Content<TData, Language>
): FormInstrument.Fields<TData, Language> {
  if (!Array.isArray(content)) {
    return content;
  }
  return content.reduce(
    (prev, current) => ({ ...prev, ...current.fields }),
    content[0]!.fields
  ) as FormInstrument.Fields<TData, Language>;
}

export function extractFieldLabel<TData extends FormInstrument.Data>(
  form: FormInstrument<TData, Language>,
  key: string,
  data: null | TData = null
) {
  const field = getFormFields(form.content)[key]!;
  if (field.kind === 'dynamic') {
    return field.render(data as FormInstrument.PartialData<TData>)?.label;
  }
  return field.label;
}
