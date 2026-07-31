import type React from 'react';

import { Label } from '@douglasneuroinformatics/libui/components';

export type FormFieldProps = {
  children: React.ReactNode;
  description?: string;
  error?: string;
  htmlFor: string;
  label: string;
};

/** A labelled form control with optional help text and a validation message beneath it. */
export const FormField = ({ children, description, error, htmlFor, label }: FormFieldProps) => (
  <div className="flex flex-col gap-1.5">
    <Label htmlFor={htmlFor}>{label}</Label>
    {description && <p className="text-muted-foreground text-xs">{description}</p>}
    {children}
    {error && (
      <p className="text-destructive text-xs font-medium" data-testid={`${htmlFor}-error`}>
        {error}
      </p>
    )}
  </div>
);
