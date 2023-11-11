export type ErrorMessageProps = {
  message: string;
  subtitle: string;
  title: string;
};

export const ErrorMessage = ({ message, subtitle, title }: ErrorMessageProps) => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-1 p-3 text-center">
      <h1 className="text-muted text-sm font-semibold uppercase tracking-wide">{title}</h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{subtitle}</h3>
      <p className="text-muted mt-2 max-w-prose text-sm sm:text-base">{message}</p>
    </div>
  );
};
