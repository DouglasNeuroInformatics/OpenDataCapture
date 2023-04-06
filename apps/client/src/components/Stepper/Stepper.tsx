import React, { useReducer } from 'react';

import { StepperDivider } from './StepperDivider';
import { StepperIcon } from './StepperIcon';

import { StepperContext } from '@/context/StepperContext';

interface Step {
  label: string;
  icon: React.ReactElement;
  element: React.ReactElement;
}

interface StepperProps {
  steps: Step[];
}

const Stepper = ({ steps }: StepperProps) => {
  const [index, updateIndex] = useReducer((prevIndex: number, action: 'increment' | 'decrement') => {
    if (action === 'decrement' && prevIndex > 0) {
      return prevIndex - 1;
    } else if (action === 'increment' && prevIndex < steps.length - 1) {
      return prevIndex + 1;
    }
    return prevIndex;
  }, 0);

  return (
    <StepperContext.Provider value={{ index, updateIndex }}>
      <div className="mx-2 mb-16 flex items-center">
        {steps.map((step, i) => (
          <>
            <StepperIcon icon={step.icon} label={step.label} variant={i === index ? 'dark' : 'light'} />
            {i < steps.length - 1 && <StepperDivider variant={i < index ? 'dark' : 'light'} />}
          </>
        ))}
      </div>
      <h3 className="mb-5 text-2xl font-semibold text-slate-900">{steps[index].label}</h3>
      <div>{steps[index].element}</div>
    </StepperContext.Provider>
  );
};

export { Stepper, type StepperProps };
