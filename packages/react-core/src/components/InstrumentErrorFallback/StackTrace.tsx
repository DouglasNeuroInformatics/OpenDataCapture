import React from 'react';

import { parse } from 'stacktrace-parser';

import { ToggledContent } from './ToggledContent';

export const StackTrace: React.FC<{ stack: string }> = ({ stack }) => {
  return (
    <ToggledContent label="Stack">
      {parse(stack).map((frame, i) => (
        <div className="text-muted-foreground text-sm" key={i}>
          <p className="ml-1">
            {`at ${frame.methodName} (`}
            <a className="hover:underline" href={frame.file ?? '#'} rel="noreferrer" target="_blank">
              {frame.file}
            </a>
            {`:${frame.lineNumber}:${frame.column})`}
          </p>
        </div>
      ))}
    </ToggledContent>
  );
};
