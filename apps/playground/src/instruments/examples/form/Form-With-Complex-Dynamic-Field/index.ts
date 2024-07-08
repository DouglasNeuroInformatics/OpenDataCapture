/* eslint-disable perfectionist/sort-objects */

const { defineInstrument } = await import('/runtime/v1/opendatacapture@1.0.0/core.js');
const { z } = await import('/runtime/v1/zod@3.23.6/index.js');

const programmingLanguages = ['JavaScript', 'Python', 'Java', 'C', 'C++', 'Rust'] as const;

type ProgrammingLanguage = (typeof programmingLanguages)[number];

const $ProgrammingLanguageKnowledge = z.object(
  Object.fromEntries(programmingLanguages.map((lang) => [`knows${lang}`, z.boolean()])) as {
    [K in ProgrammingLanguage as `knows${K}`]: ReturnType<typeof z.boolean>;
  }
);

function createKnowledgeField(lang: ProgrammingLanguage) {
  return {
    kind: 'boolean',
    label: `Do you know ${lang}?`,
    variant: 'radio'
  } as const;
}

const programmingLanguageKnowledgeFields = Object.fromEntries(
  programmingLanguages.map((lang) => [`knows${lang}`, createKnowledgeField(lang)])
) as {
  [K in ProgrammingLanguage as `knows${K}`]: ReturnType<typeof createKnowledgeField>;
};

export default defineInstrument({
  kind: 'FORM',
  language: 'en',
  internal: {
    edition: 1,
    name: 'PROGRAMMING_LANGUAGE_COMPETENCY'
  },
  tags: ['Dynamic'],
  content: {
    ...programmingLanguageKnowledgeFields
  },
  details: {
    description: 'This is an example of a complex form with conditional rendering and validation logic',
    estimatedDuration: 1,
    instructions: ['Please respond to all questions'],
    license: 'Apache-2.0',
    title: 'Programming Language Competency'
  },
  measures: {},
  validationSchema: $ProgrammingLanguageKnowledge
});
