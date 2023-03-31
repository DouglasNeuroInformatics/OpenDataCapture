import { FormField, FormFields, FormInstrumentContent, FormInstrumentData } from '@ddcp/common';

/** Extract default values for type T from instrument content */
export function getDefaultFormValues<T extends FormInstrumentData>(formContent: FormInstrumentContent<T>): T {
  const fields: FormField[] = [];
  if (Array.isArray(formContent)) {
    for (const group of formContent) {
      for (let i = 0; i < Object.keys(group.fields).length; i++) {
        fields.push(group.fields[i]!);
      }
    }
  }
}
