import React from 'react';

import { FormInstrument } from '@ddcp/common';

import { Button, FormValues, Spinner } from '@/components';

export interface FormSummaryProps {
  instrument: FormInstrument;
  result?: FormValues;
}

export const FormSummary = ({ result }: FormSummaryProps) => {
  if (!result) {
    return <Spinner />;
  }
  return (
    <div className="print:hidden">
      <div className="mb-3">
        {Object.keys(result).map((fieldName) => {
          return (
            <div key={fieldName}>
              {fieldName}: {result[fieldName] as string}
            </div>
          );
        })}
      </div>
      <Button label="Print" onClick={() => print()} />
    </div>
  );
};
