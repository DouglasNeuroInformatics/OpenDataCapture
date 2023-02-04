import React from 'react';

export interface FormGroupProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode | React.ReactNode[];
  title: string;
}

export const FormGroup = ({ children, title, ...props }: FormGroupProps) => {
  return (
    <div {...props}>
      <h3 className="text-xl font-bold text-slate-700">{title}</h3>
      {children}
    </div>
  );
};
