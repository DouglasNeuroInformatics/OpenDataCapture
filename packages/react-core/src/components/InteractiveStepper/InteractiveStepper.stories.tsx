import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { InteractiveStepper } from './InteractiveStepper';

type Story = StoryObj<typeof InteractiveStepper>;

export default { component: InteractiveStepper } satisfies Meta<typeof InteractiveStepper>;

export const Default: Story = {
  args: {
    instrument: {
      content: {
        render: (done) => {
          const [count, setCount] = useState(0);
          return (
            <div className="flex flex-col">
              <div>
                <h1 className="text-center text-lg font-semibold">Click Task</h1>
                <p>Instructions: Please click the button as many times as possible in the allotted time</p>
                <p>Count: {count}</p>
              </div>
              <button
                onClick={() => {
                  setCount(count + 1);
                }}
              >
                Increase Count
              </button>
              <button type="button" onClick={() => done({ count })}>
                Done
              </button>
            </div>
          );
        }
      },
      details: {
        description: 'This task is completely useless. It is a proof of concept for an interactive instrument.',
        estimatedDuration: 1,
        instructions:
          'When you begin this task, a 10 second countdown will begin. Please click the button as many times as you can before it expires.',
        title: 'Click Task'
      },
      kind: 'interactive',
      language: 'en',
      name: 'InteractiveInstrument',
      tags: ['Interactive'],
      validationSchema: z.any(),
      version: 1.0
    },
    subject: {
      dateOfBirth: new Date(2000, 0, 1),
      firstName: 'Jane',
      identifier: '123',
      lastName: 'Doe',
      sex: 'female'
    }
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-3xl">
        <Story />
      </div>
    )
  ]
};
