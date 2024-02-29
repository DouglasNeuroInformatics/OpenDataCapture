import { Spinner } from '@douglasneuroinformatics/ui/components';

export const LoadingFallback = () => (
  <div className="flex flex-grow items-center justify-center">
    <Spinner />
  </div>
);
