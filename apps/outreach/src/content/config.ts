import { docsSchema } from '@astrojs/starlight/schema';
import { defineCollection, reference, z } from 'astro:content';

export const collections = {
  blog: defineCollection({
    schema: z.object({
      author: reference('team'),
      datePublished: z.date(),
      description: z.string().min(1),
      isDraft: z.boolean().optional(),
      language: z.enum(['en', 'fr']),
      title: z.string().min(1),
      type: z.enum(['article', 'caseStudy', 'video'])
    })
  }),
  docs: defineCollection({ schema: docsSchema() }),
  faq: defineCollection({
    schema: z.object({
      entries: z.array(
        z.object({
          answer: z.object({
            en: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
            fr: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)])
          }),
          question: z.object({
            en: z.string().min(1),
            fr: z.string().min(1)
          })
        })
      ),
      title: z.object({
        en: z.string().min(1),
        fr: z.string().min(1)
      })
    }),
    type: 'data'
  }),
  team: defineCollection({
    schema: ({ image }) =>
      z.object({
        description: z.object({
          en: z.string().min(1),
          fr: z.string().min(1)
        }),
        fullName: z.string(),
        image: image().refine((arg) => arg.height === arg.width, {
          message: 'Image must be square (1:1 aspect ratio)'
        }),
        position: z.object({
          en: z.string().min(1),
          fr: z.string().min(1)
        }),
        seniority: z.number().positive().int(),
        suffix: z.enum(['MD', 'PhD']).optional()
      }),
    type: 'data'
  }),
  testimonials: defineCollection({
    schema: ({ image }) =>
      z.object({
        format: z.enum(['short', 'long']),
        fullName: z.string().min(1),
        image: image().refine((arg) => arg.height === arg.width, {
          message: 'Image must be square (1:1 aspect ratio)'
        }),
        position: z.object({
          en: z.string().min(1),
          fr: z.string().min(1)
        }),
        quote: z.object({
          en: z.string().min(1),
          fr: z.string().min(1)
        }),
        suffix: z.enum(['MD', 'PhD']).optional()
      }),
    type: 'data'
  })
};
