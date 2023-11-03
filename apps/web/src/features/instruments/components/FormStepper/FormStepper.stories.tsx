import type { Meta, StoryObj } from '@storybook/react';
import { z } from 'zod';

import { FormStepper } from './FormStepper';

type Story = StoryObj<typeof FormStepper>;

export default { component: FormStepper } satisfies Meta<typeof FormStepper>;

export const Default: Story = {
  args: {
    activeVisit: {
      date: new Date(),
      subject: {
        dateOfBirth: new Date(2000, 0, 1),
        firstName: 'Jane',
        identifier: '123',
        lastName: 'Doe',
        sex: 'female'
      }
    },
    form: {
      content: {
        overallHappiness: {
          isRequired: true,
          kind: 'numeric',
          label: 'Overall Happiness',
          max: 10,
          min: 1,
          variant: 'slider'
        },
        reasonForSadness: {
          deps: ['overallHappiness'],
          kind: 'dynamic',
          render(data) {
            if (!data?.overallHappiness || data.overallHappiness as number > 5) {
              return null;
            }
            return {
              kind: 'text',
              label: 'Reason for Sadness',
              variant: 'long'
            };
          }
        }
      },
      details: {
        description: 'The Happiness Questionnaire is a questionnaire about happiness.',
        estimatedDuration: 1,
        instructions: 'Please answer the question based on your current feelings.',
        title: 'Happiness Questionnaire'
      },
      kind: 'form',
      language: 'en',
      name: 'HappinessQuestionnaire',
      tags: ['Well-Being'],
      validationSchema: z.object({
        overallHappiness: z.number().int().gte(1).lte(10),
        reasonForSadness: z.string().optional()
      }),
      version: 1
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
