import { Card, cn } from '@douglasneuroinformatics/ui';

import { StackTrace } from './StackTrace';

export const CompileErrorFallback: React.FC<{ className?: string; error: Error }> = ({ className, error }) => {
  return (
    <Card className={cn('flex max-h-full flex-col p-3 tracking-tight', className)}>
      <div className="h-full overflow-scroll">
        <div className="space-y-1 py-3">
          <h3 className="text-lg font-bold">Failed to Compile</h3>
          <span className="font-semibold text-red-500">Error: {error.message}</span>
        </div>
        {error.stack && <StackTrace stack={error.stack} />}
      </div>
    </Card>
  );
};
