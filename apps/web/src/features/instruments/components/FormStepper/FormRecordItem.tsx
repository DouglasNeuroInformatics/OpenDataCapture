export type FormRecordItemProps = {
  label: string;
  value: boolean | null | number | string | undefined;
};

export const FormRecordItem = ({ label, value }: FormRecordItemProps) => (
  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 sm:py-5">
    <dt className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</dt>
    <dd className="mt-1 text-sm text-slate-900 dark:text-slate-100 sm:col-span-2 sm:mt-0">{value}</dd>
  </div>
);
