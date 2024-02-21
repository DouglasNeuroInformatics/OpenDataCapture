import { Card } from '@douglasneuroinformatics/ui';

export const CompileErrorFallback: React.FC<{ error: Error }> = ({ error }) => (
  <div className="flex h-full flex-col items-center justify-center">
    <h3 className="mb-3 text-center font-semibold">Failed to Compile</h3>
    <Card className="overflow-scroll">
      <code className="text-sm">{error.message}</code>
    </Card>
  </div>
);
