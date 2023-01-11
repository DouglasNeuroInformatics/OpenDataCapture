import Form, { FormErrors } from './Form';
import SubmitButton from './SubmitButton';
import TextField from './TextField';

export type { FormErrors };

export default Object.assign(Form, {
  SubmitButton,
  TextField
});
