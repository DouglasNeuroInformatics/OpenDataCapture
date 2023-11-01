import { XMarkIcon } from '@heroicons/react/24/outline';

export type EditorTabProps = {
  label: string;
};

export const EditorTab = ({ label }: EditorTabProps) => {
  return (
    <div className="flex w-fit items-center justify-between gap-10 px-6 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
      <span>{label}</span>
      <button className="justify-self-end rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600">
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
