import { defineCollection, reference, z } from 'astro:content';

export const collections = {
  blog: defineCollection({
    schema: z.object({
      author: reference('team'),
      datePublished: z.date(),
      description: z.string(),
      language: z.enum(['en', 'fr']),
      title: z.string(),
      type: z.enum(['article', 'caseStudy', 'video'])
    })
  }),
  team: defineCollection({
    schema: ({ image }) =>
      z.object({
        description: z.string(),
        fullName: z.string(),
        image: image().refine((arg) => arg.height === arg.width, {
          message: 'Image must be square (1:1 aspect ratio)'
        }),
        position: z.string(),
        seniority: z.number().positive().int(),
        suffix: z.enum(['MD', 'PhD']).optional()
      }),
    type: 'data'
  }),
  testimonials: defineCollection({
    schema: ({ image }) =>
      z.object({
        format: z.enum(['short', 'long']),
        fullName: z.string(),
        image: image().refine((arg) => arg.height === arg.width, {
          message: 'Image must be square (1:1 aspect ratio)'
        }),
        position: z.object({
          en: z.string(),
          fr: z.string()
        }),
        quote: z.object({
          en: z.string(),
          fr: z.string()
        }),
        suffix: z.enum(['MD', 'PhD']).optional()
      }),
    type: 'data'
  })
};
