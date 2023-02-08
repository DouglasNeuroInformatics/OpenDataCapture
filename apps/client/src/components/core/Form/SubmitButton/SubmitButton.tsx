import React from 'react';

import { Button } from '@/components/base';

export interface SubmitButtonProps {
  label?: string;
}

export const SubmitButton = ({ label = 'Submit' }: SubmitButtonProps) => {
  return <Button className="my-4 w-full" label={label} type="submit" />;
};
