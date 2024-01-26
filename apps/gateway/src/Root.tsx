import { InstrumentRenderer } from '@open-data-capture/instrument-renderer';

export type RootProps = {
  bundle: string;
};

export const Root = ({ bundle }: RootProps) => {
  const handleSubmit = (data: unknown) => {
    // eslint-disable-next-line no-alert
    alert(JSON.stringify(data, null, 2));
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <InstrumentRenderer bundle={bundle} className="min-h-full" onSubmit={handleSubmit} />
    </div>
  );
};
