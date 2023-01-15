import React from 'react';

export interface SubmitButtonProps {
  label?: string;
}

export const SubmitButton = ({ label = 'Submit' }: SubmitButtonProps) => {
  return (
    <button className="my-4 w-full rounded-md bg-indigo-800 px-2 py-1 text-white" type="submit">
      {label}
    </button>
  );
};

