import type React from 'react';

import { AlertCircleIcon } from 'lucide-react';

export const ErrorBox: React.FC<{ issues?: string[]; title: string }> = ({ issues, title }) => {
  return (
    <div
      className="border-destructive/50 bg-destructive/10 text-destructive flex flex-col gap-2 rounded-md border p-3"
      data-testid="error-box"
    >
      <div className="flex items-center gap-2">
        <AlertCircleIcon className="shrink-0" style={{ height: '16px', strokeWidth: '2px', width: '16px' }} />
        <p className="text-tiny leading-none font-medium">{title}</p>
      </div>
      {issues && (
        <ul className="flex flex-col gap-0.5 pl-6 text-xs">
          {issues.map((issue, index) => (
            <li className="flex items-start space-x-1.5" key={index}>
              <span className="text-destructive/60 mt-1 h-1 w-1 shrink-0 rounded-full bg-current" />
              <span data-testid="error-box-issue">{issue}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
