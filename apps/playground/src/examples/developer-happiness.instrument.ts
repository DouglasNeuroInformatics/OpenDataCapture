/* eslint-disable perfectionist/sort-objects */

type DeveloperHappinessData = {
  developerHappiness: number;
  reasonForSadness?: string;
  recentCommits: {
    dateOfMerge?: Date;
    description: string;
    id: string;
    isMerged: boolean;
  }[];
};

const developerHappinessQuestionnaire: FormInstrument<DeveloperHappinessData, InstrumentLanguage> = {
  kind: 'form',
  name: 'TestInstrument',
  language: 'en',
  tags: ['Well-Being'],
  version: 1.1,
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
        console.log(data);
        if (data?.developerHappiness === undefined || data?.developerHappiness === null) return null;
        if (data.developerHappiness < 5) {
          return {
            kind: 'text',
            label: 'Why are you unhappy?',
            description: 'Tell the truth',
            variant: 'short'
          };
        } else {
          return null;
        }
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
            } as unknown as null;
          }
        },
        description: { kind: 'text', label: 'Describe the commit', variant: 'short' }
      }
    }
  },
  validationSchema: z.object({
    developerHappiness: z.number().min(0).max(10),
    reasonForSadness: z.string().optional(),
    recentCommits: z.array(
      z.object({ id: z.string(), description: z.string(), isMerged: z.boolean(), dateOfMerge: z.date().optional() })
    )
  }),
  details: {
    title: 'Developer happiness questionnaire',
    description: 'This is where we check if people are unhappy with TypeScript',
    estimatedDuration: 5,
    instructions: 'You know how to use the web'
  }
};

export default developerHappinessQuestionnaire;
