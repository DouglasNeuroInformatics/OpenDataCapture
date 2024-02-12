import { Spinner } from '@douglasneuroinformatics/ui';

export type LoadingScreenProps = {
  subtitle: string;
  title: string;
};

export const LoadingScreen = ({ subtitle, title }: LoadingScreenProps) => {
  return (
    <div className="my-auto flex h-screen w-screen flex-col items-center justify-center">
      <div className="mt-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">{subtitle}</p>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{title}</h1>
      </div>
      <div className="h-min p-48">
        <Spinner />
      </div>
    </div>
  );
};
