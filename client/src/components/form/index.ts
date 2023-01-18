import { DateField } from './DateField';
import { FormElement } from './FormElement';
import { SelectField } from './SelectField';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export const Form = Object.assign(FormElement, {
  DateField,
  SelectField,
  SubmitButton,
  TextField
});
