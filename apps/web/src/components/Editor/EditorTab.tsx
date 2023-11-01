import { HiXMark } from 'react-icons/hi2';

export type EditorTabProps = {
  label: string;
};

export const EditorTab = ({ label }: EditorTabProps) => {
  return (
    <div className="flex items-center justify-center px-6 py-2 hover:bg-slate-100">
      <span>{label}</span>
      <button className="justify-self-end rounded-md p-0.5 hover:bg-slate-200">
        <HiXMark />
      </button>
    </div>
  );
};
