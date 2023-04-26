import React, { memo, useRef } from 'react';

import { FormInstrument } from '@douglasneuroinformatics/common';
import { RadioGroup } from '@headlessui/react';
import { HiCheck } from 'react-icons/hi2';
import { LegendProps } from 'recharts';

type TForm = FormInstrument & { identifier: string };

type QuerySelectorProps = LegendProps & {
  instruments: Array<TForm>;
  selectedInstrument?: TForm;
  setSelectedInstrument?: (form: TForm) => void;
};

const QuerySelector = memo(function QuerySelector({
  instruments,
  payload,
  selectedInstrument,
  setSelectedInstrument
}: QuerySelectorProps) {
  const render = useRef(0);

  render.current++;
  //console.log(data[0].records);

  return (
    <div className="h-full">
      <div>
        <h5 className="font-semibold">Instruments</h5>
        <RadioGroup value={selectedInstrument} onChange={setSelectedInstrument}>
          {instruments.map((instrument) => (
            <RadioGroup.Option className="flex items-center" key={instrument.identifier} value={instrument}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 hover:bg-slate-50 hover:shadow-xl">
                <HiCheck className="ui-checked:opacity-100 duration-400 text-slate-600 opacity-0 transition-opacity ease-in-out" />
              </div>
              <span className="ms-2">{instrument.details.title}</span>
            </RadioGroup.Option>
          ))}
        </RadioGroup>
      </div>
      <div>
        <h5 className="font-semibold">Measures</h5>
      </div>
      <ul>
        {payload?.map((entry, index) => (
          <li key={`item-${index}`}>{entry.value}</li>
        ))}
      </ul>
    </div>
  );
});

export { QuerySelector, QuerySelectorProps };
