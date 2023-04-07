import React, { useReducer } from 'react';

import { ArrayFormField } from '@ddcp/common';

import { BaseFieldProps, NullableArrayFieldValue } from './types';

type ArrayFieldProps = BaseFieldProps<NullableArrayFieldValue> & ArrayFormField;

export const ArrayField = ({ name, label, fieldset, value, setValue }: ArrayFieldProps) => {
  return <span>Array Field</span>;
  /*

  const [state, dispatch] = useReducer(
    (prevState: (typeof fieldset)[], action: 'append' | 'remove') => {
      const newState = [...prevState];
      if (action === 'append') {
        newState.push({ ...fieldset });
      } else if (action === 'remove' && prevState.length > 1) {
        newState.pop();
      }
      return newState;
    },
    [fieldset]
  );

  return (
    <div>
      <span className="field-header">{label}</span>

      {Object.keys(fieldset).map((fieldName) => {
        const props = { name: fieldName + '_1', ...fieldset[fieldName] };
        return <PrimitiveFormField key={fieldName} {...props} />;
      })}
      <div className="mb-5 flex gap-5">
        <Button label="Append" type="button" onClick={() => dispatch('append')} />
        <Button label="Remove" type="button" onClick={() => dispatch('remove')} />
      </div>
    </div>
  );
  */
};
