import type { ArrayFieldValue, PrimitiveFieldValue } from '@douglasneuroinformatics/form-types';
import { P, match } from 'ts-pattern';

export type FormSummaryGroupProps = {
  items: ({
    label: string;
    value?: ArrayFieldValue | PrimitiveFieldValue;
  } | null)[];
  title: string;
};

export const FormSummaryGroup = ({ items, title }: FormSummaryGroupProps) => {
  return (
    <div className="px-4 py-5 sm:px-6">
      <h5 className="mb-2 font-medium">{title}</h5>
      <dl>
        {items.map(
          (item, i) =>
            item && (
              <div className="my-1 sm:grid sm:grid-cols-3 sm:gap-4" key={i}>
                <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.label}</dt>
                <dd className="mt-1 text-sm text-slate-900 sm:col-span-2 sm:mt-0 dark:text-slate-100">
                  {match(item.value)
                    .with(P.array(), (arr) => JSON.stringify(arr))
                    .with(P.union(P.string, P.number, P.boolean, P.instanceOf(Date)), (value) => value.toString())
                    .otherwise(() => 'NA')}
                </dd>
              </div>
            )
        )}
      </dl>
    </div>
  );
};
