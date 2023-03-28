import React, { useReducer } from 'react';

import { Button } from '../Button';

import { StepperDivider } from './StepperDivider';
import { StepperIcon } from './StepperIcon';

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
    <div>
      <div className="mb-16 flex items-center">
        {steps.map((step, i) => (
          <>
            <StepperIcon icon={step.icon} label={step.label} variant={i === index ? 'dark' : 'light'} />
            {i < steps.length - 1 && <StepperDivider variant={i < index ? 'dark' : 'light'} />}
          </>
        ))}
      </div>
      <div>{steps[index].element}</div>
      <div className="mx-auto flex max-w-lg justify-between">
        <Button label="Previous" onClick={() => updateIndex('decrement')} />
        <Button label="Next" onClick={() => updateIndex('increment')} />
      </div>
    </div>
  );
};

export { Stepper, type StepperProps };
