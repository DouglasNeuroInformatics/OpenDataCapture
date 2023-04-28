import React from 'react';

import { BinaryFormField } from '@douglasneuroinformatics/common';
import { RadioGroup, Switch } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { HiCheck } from 'react-icons/hi2';

import { FormFieldContainer } from './FormFieldContainer';
import { BaseFieldProps } from './types';

type BinaryFieldProps = BaseFieldProps<boolean | null> & BinaryFormField;

type InnerProps = Pick<BinaryFieldProps, 'name' | 'label' | 'value' | 'setValue'>;

const Checkbox = (props: InnerProps) => (
  <>
    <label className="field-label" htmlFor={props.name}>
      {props.label}
    </label>
    <div className="field-input-base">
      <Switch checked={Boolean(props.value)} className="w-fit border" onChange={props.setValue}>
        <HiCheck className="ui-checked:visible invisible" />
      </Switch>
    </div>
  </>
);

const RadioOption = ({ value, label }: { value: true | false; label?: string }) => {
  const { t } = useTranslation('form');
  return (
    <RadioGroup.Option className="flex items-center" value={value}>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:shadow-xl">
        <HiCheck className="ui-checked:opacity-100 duration-400 text-slate-600 opacity-0 transition-opacity ease-in-out" />
      </div>
      <span className="ms-2">{label ?? t(`radio.labels.${value}`)}</span>
    </RadioGroup.Option>
  );
};

const Radio = (props: InnerProps & { options?: { t: string; f: string } }) => {
  return (
    <RadioGroup value={props.value} onChange={props.setValue}>
      <RadioGroup.Label className="field-label">{props.label}</RadioGroup.Label>
      <div className="mt-4 flex flex-col gap-5">
        <RadioOption label={props.options?.t} value={true} />
        <RadioOption label={props.options?.f} value={false} />
      </div>
    </RadioGroup>
  );
};

const BinaryField = ({ description, error, variant, ...props }: BinaryFieldProps) => {
  return (
    <FormFieldContainer description={description} error={error}>
      {variant === 'checkbox' && <Checkbox {...props} />}
      {variant === 'radio' && <Radio {...props} />}
    </FormFieldContainer>
  );
};

export { BinaryField, type BinaryFieldProps };
