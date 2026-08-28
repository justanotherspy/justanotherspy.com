import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tag: z.string(),
    description: z.string(),
    dateLabel: z.string(),
    stack: z.string(),
    version: z.string(),
    licence: z.string(),
    github: z.url(),
    install: z.string(),
    order: z.number().optional(),
  }),
});

export const collections = { projects };
