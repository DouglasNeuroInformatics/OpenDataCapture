import type { Meta, StoryObj } from '@storybook/react';

import { InstrumentSandbox } from './InstrumentSandbox';

type Story = StoryObj<typeof InstrumentSandbox>;

const { useState } = await import('/runtime/v0.0.1/react.js');
const { z } = await import('/runtime/v0.0.1/zod.js');

export default { component: InstrumentSandbox } as Meta<typeof InstrumentSandbox>;

export const Default: Story = {
  args: {
    instrument: {
      content: {
        render: (done: (data: unknown) => void) => {
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
  }
};
