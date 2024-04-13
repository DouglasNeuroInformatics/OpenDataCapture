import React from 'react';

export type ErrorFallbackProps = {
  description: string;
  subtitle: string;
  title: string;
};
export const ErrorFallback = ({ description, subtitle, title }: ErrorFallbackProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-3 text-center">
      <h1 className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">{title}</h1>
      <h3 className="text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{subtitle}</h3>
      <p className="text-muted-foreground mt-2 max-w-prose text-pretty text-sm sm:text-base">{description}</p>
    </div>
  );
};
