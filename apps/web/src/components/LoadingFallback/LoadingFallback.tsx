import { Spinner } from '@douglasneuroinformatics/libui/components';

export const LoadingFallback = () => (
  <div className="flex h-full w-full grow items-center justify-center">
    <Spinner />
  </div>
);
