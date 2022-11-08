import React from 'react';

interface FieldGroupProps {
  children: React.ReactNode;
  title: string;
}

const FieldsGroup = ({ children, title }: FieldGroupProps) => {
  return (
    <div className="my-5">
      <h4 className="mb-3">{title}</h4>
      {children}
    </div>
  );
};

export default FieldsGroup;
