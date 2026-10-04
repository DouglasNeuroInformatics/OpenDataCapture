import type { FormInstrument, Language } from '@opendatacapture/runtime-core';

/** Extract a flat array of form fields from the content. This function assumes there are no duplicate keys in groups  */
export function getFormFields<TData extends FormInstrument.Data>(
  content: FormInstrument.Content<TData, Language>
): FormInstrument.Fields<TData, Language> {
  if (!Array.isArray(content)) {
    return content;
  }
  return content.reduce((previous, current) => {
    if (current.kind === 'block') {
      return previous;
    }
    return { ...previous, ...current.fields };
  }, {}) as FormInstrument.Fields<TData, Language>;
}

/** Whether the field is a dynamic one that `data` keeps hidden, so the respondent never saw it */
export function isFieldHidden<TData extends FormInstrument.Data>(
  form: FormInstrument<TData, Language>,
  key: string,
  data: { [key: string]: unknown }
) {
  const field = getFormFields(form.content)[key];
  return field?.kind === 'dynamic' && field.render(data as FormInstrument.PartialData<TData>) === null;
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
