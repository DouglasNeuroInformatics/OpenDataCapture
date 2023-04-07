import React from 'react';

import { BinaryFormField } from '@ddcp/common';
import { Switch } from '@headlessui/react';
import { HiCheck } from 'react-icons/hi2';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

export type BinaryFieldProps = BaseFieldProps<boolean | null> & BinaryFormField;

export const BinaryField = ({ description, name, label, error, value, setValue }: BinaryFieldProps) => {
  return (
    <FormFieldContainer description={description} error={error}>
      <label className="field-label" htmlFor={name}>
        {label}
      </label>
      <div className="field-input-base">
        <Switch checked={Boolean(value)} className="w-fit border" onChange={setValue}>
          <HiCheck className="ui-checked:visible invisible" />
        </Switch>
      </div>
    </FormFieldContainer>
  );
};
