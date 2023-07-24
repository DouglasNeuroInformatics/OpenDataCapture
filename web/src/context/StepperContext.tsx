import React, { createContext } from 'react';

export const StepperContext = createContext<{
  index: number;
  updateIndex: React.Dispatch<'increment' | 'decrement'>;
}>(null!);
