import { Heading } from '@douglasneuroinformatics/libui/components';

export type ContentPlaceholderProps = {
  message?: string;
  title: string;
};

export const ContentPlaceholder = ({ message, title }: ContentPlaceholderProps) => {
  return (
    <div className="mx-auto flex max-w-prose flex-grow flex-col items-center justify-center space-y-1 py-32 text-center">
      <Heading className="font-medium" variant="h5">
        {title}
      </Heading>
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
    </div>
  );
};
