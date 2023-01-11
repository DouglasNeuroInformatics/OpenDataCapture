import { createContext } from 'react';

import { FormErrors } from '@/components/Form';

interface FormContextInterface {
  errors: FormErrors | null;
}

const FormContext = createContext<FormContextInterface>({ errors: null });

export { FormContext as default, type FormContextInterface };
