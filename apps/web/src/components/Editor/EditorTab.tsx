import { XMarkIcon } from '@heroicons/react/24/outline';

import type { EditorModel } from './types';

export type EditorTabProps = {
  model: EditorModel;
  onClose: (id: string) => void;
};

export const EditorTab = ({ model, onClose }: EditorTabProps) => {
  return (
    <div className="flex w-fit items-center justify-between gap-10 px-6 py-2 hover:bg-slate-100 dark:hover:bg-slate-700">
      <span>{model.uri.path.slice(1)}</span>
      <button
        className="justify-self-end rounded-md p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600"
        type="button"
        onClick={() => {
          onClose(model.id);
        }}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
