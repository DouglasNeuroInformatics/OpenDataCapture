import React from 'react';

import { BinaryFormField } from '@ddcp/common';
import { Switch } from '@headlessui/react';
import { HiCheck } from 'react-icons/hi2';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

import { useFormField } from '@/hooks/useFormField';

type BinaryFieldProps = BaseFieldProps<BinaryFormField>;

export const BinaryField = ({ description, name, label }: BinaryFieldProps) => {
  const { error, value, setValue } = useFormField<boolean>(name);

  return (
    <FormFieldContainer description={description} error={error}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className="field-input-base">
        <Switch checked={value} className="w-fit border" onChange={setValue}>
          <HiCheck className="ui-checked:visible invisible" />
        </Switch>
      </div>
    </FormFieldContainer>
  );
};
