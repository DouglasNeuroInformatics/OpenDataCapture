/* eslint-disable perfectionist/sort-objects */

const { InstrumentFactory } = await import('/runtime/v0.0.1/core.js');
const { z } = await import('/runtime/v0.0.1/zod');

type DeveloperHappinessData = {
  developerHappiness: number;
  reasonForSadness?: string;
  recentCommits: {
    commitDescription: string;
    dateOfMerge?: Date;
    id: string;
    isMerged: boolean;
  }[];
};

const instrumentFactory = new InstrumentFactory({
  kind: 'form',
  language: 'en'
});

export default instrumentFactory.defineInstrument<DeveloperHappinessData>({
  name: 'TestInstrument',
  tags: ['Well-Being'],
  version: 1.1,
  details: {
    title: 'Developer happiness questionnaire',
    description: 'This is where we check if people are unhappy with TypeScript',
    estimatedDuration: 5,
    instructions: 'You know how to use the web'
  },
  content: {
    developerHappiness: {
      kind: 'numeric',
      label: 'This is how happy a developer is',
      description: 'You hovered on the tooltip',
      variant: 'default'
    },
    reasonForSadness: {
      kind: 'dynamic',
      deps: ['developerHappiness'],
      render: (data) => {
        if (data?.developerHappiness && data.developerHappiness < 5) {
          return {
            kind: 'text',
            label: 'Why are you unhappy?',
            description: 'Tell the truth',
            variant: 'short'
          };
        }
        return null;
      }
    },
    recentCommits: {
      kind: 'array',
      label: 'Give me a list of commits',
      description: 'NO',
      fieldset: {
        id: { kind: 'text', label: 'Commit ID', variant: 'short' },
        isMerged: { kind: 'binary', label: 'Is the commit merged?', variant: 'radio' },
        dateOfMerge: {
          kind: 'dynamic-fieldset',
          render: (fieldset) => {
            if (!fieldset.isMerged) return null;
            return {
              kind: 'date',
              label: 'Date the commit was merged'
            };
          }
        },
        commitDescription: { kind: 'text', label: 'Describe the commit', variant: 'short' }
      }
    }
  },
  validationSchema: z.object({
    developerHappiness: z.number().min(0).max(10),
    reasonForSadness: z.string().optional(),
    recentCommits: z.array(
      z.object({
        id: z.string(),
        commitDescription: z.string(),
        isMerged: z.boolean(),
        dateOfMerge: z.date().optional()
      })
    )
  })
});
