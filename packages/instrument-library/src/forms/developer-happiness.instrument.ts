/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/core.js');
const { z } = await import('/runtime/v1/zod.js');

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  name: 'TestInstrument',
  tags: ['Well-Being'],
  version: 1.1,
  details: {
    title: 'Developer happiness questionnaire',
    description: 'This is where we check if people are unhappy with TypeScript',
    estimatedDuration: 5,
    license: 'AGPL-3.0',
    instructions: ['You know how to use the web']
  },
  content: {
    developerHappiness: {
      kind: 'number',
      label: 'This is how happy a developer is',
      description: 'You hovered on the tooltip',
      variant: 'input'
    },
    reasonForSadness: {
      kind: 'dynamic',
      deps: ['developerHappiness'],
      render: (data) => {
        if (data?.developerHappiness && data.developerHappiness < 5) {
          return {
            kind: 'string',
            label: 'Why are you unhappy?',
            description: 'Tell the truth',
            variant: 'input'
          };
        }
        return null;
      }
    },
    recentCommits: {
      kind: 'record-array',
      label: 'Give me a list of commits',
      description: 'NO',
      fieldset: {
        id: { kind: 'string', label: 'Commit ID', variant: 'input' },
        isMerged: { kind: 'boolean', label: 'Is the commit merged?', variant: 'radio' },
        dateOfMerge: {
          kind: 'dynamic',
          render: (fieldset) => {
            if (!fieldset.isMerged) return null;
            return {
              kind: 'date',
              label: 'Date the commit was merged'
            };
          }
        },
        commitDescription: { kind: 'string', label: 'Describe the commit', variant: 'input' }
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
