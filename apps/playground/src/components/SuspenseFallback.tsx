import { Spinner } from '@douglasneuroinformatics/ui';

export const SuspenseFallback = () => {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <Spinner />
    </div>
  );
};
