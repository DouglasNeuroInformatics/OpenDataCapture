import React from 'react';

import { Heading } from '@douglasneuroinformatics/libui/components';
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
    <div className="py-2">
      <Heading variant="h5">{title}</Heading>
      <dl>
        {items.map(
          (item, i) =>
            item && (
              <div className="text-muted-foreground my-1 text-sm sm:grid sm:grid-cols-3 sm:gap-4" key={i}>
                <dt className="font-medium">{item.label}</dt>
                <dd className="mt-1 text-sm  sm:col-span-2 sm:mt-0">
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
