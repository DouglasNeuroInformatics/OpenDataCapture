import React from 'react';

import { P, match } from 'ts-pattern';

export type InstrumentSummaryGroupProps = {
  items: ({
    label: string;
    value?: unknown;
  } | null)[];
  title: string;
};

export const InstrumentSummaryGroup = ({ items, title }: InstrumentSummaryGroupProps) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <h5 className="mb-2 font-medium">{title}</h5>
      <dl>
        {items.map(
          (item, i) =>
            item && (
              <div className="my-1 sm:grid sm:grid-cols-3 sm:gap-4" key={i}>
                <dt className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</dt>
                <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 dark:text-slate-100">
                  {match(item.value)
                    .with(P.union(P.string, P.number, P.boolean, P.instanceOf(Date)), (value) => value.toString())
                    .with(P.array(), (arr) => JSON.stringify(arr))
                    .with(P.union([P.nullish, '']), () => 'NA')
                    .otherwise((value) => JSON.stringify(value))}
                </dd>
              </div>
            )
        )}
      </dl>
    </div>
  );
};
