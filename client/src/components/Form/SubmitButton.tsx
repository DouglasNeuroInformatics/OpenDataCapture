import React from 'react';

interface SubmitButtonProps {
  label?: string;
}

const SubmitButton = ({ label = 'Submit' }: SubmitButtonProps) => {
  return (
    <button className="w-full rounded-md bg-indigo-800 px-2 py-1 text-white" type="submit">
      {label}
    </button>
  );
};

export { SubmitButton as default, type SubmitButtonProps };
