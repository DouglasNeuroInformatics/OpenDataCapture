import { defineCollection, z } from 'astro:content';

export const collections = {
  blog: defineCollection({
    schema: z.object({
      title: z.string(),
      author: z.string(),
      date: z.date()
    })
  }),
  team: defineCollection({
    type: 'data',
    schema: ({ image }) =>
      z.object({
        fullName: z.string(),
        suffix: z.string().optional(),
        position: z.string(),
        image: image().refine((arg) => arg.height === arg.width, {
          message: 'Image must be square (1:1 aspect ratio)'
        }),
        description: z.string(),
        seniority: z.number().positive().int()
      })
  })
};
