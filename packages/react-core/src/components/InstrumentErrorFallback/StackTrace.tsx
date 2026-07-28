import React from 'react';

import { parse } from 'stacktrace-parser';

import { ToggledContent } from './ToggledContent';

export const StackTrace: React.FC<{ stack: string }> = ({ stack }) => {
  return (
    <ToggledContent label="Stack">
      {parse(stack).map((frame, i) => {
        // Deliberately untranslated: this reproduces the `at method (file:line:column)` syntax a
        // developer reads in a browser stack trace, not user-facing copy.
        const openingFrame = `at ${frame.methodName} (`;
        const closingFrame = `:${frame.lineNumber}:${frame.column})`;
        return (
          <div className="text-muted-foreground text-sm" key={i}>
            <p className="ml-1">
              {openingFrame}
              <a className="hover:underline" href={frame.file ?? '#'} rel="noreferrer" target="_blank">
                {frame.file}
              </a>
              {closingFrame}
            </p>
          </div>
        );
      })}
    </ToggledContent>
  );
};
