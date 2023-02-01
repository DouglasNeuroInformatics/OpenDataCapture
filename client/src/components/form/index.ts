import { DateField } from './DateField';
import { FormElement } from './FormElement';
import { FormGroup } from './FormGroup';
import { SelectField } from './SelectField';
import { SubmitButton } from './SubmitButton';
import { TextField } from './TextField';

export const Form = Object.assign(FormElement, {
  DateField,
  Group: FormGroup,
  SelectField,
  SubmitButton,
  TextField
});
